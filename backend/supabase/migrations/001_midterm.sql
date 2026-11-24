-- Apply once in a Supabase project's SQL editor. Do not run over existing tables.
begin;
create extension if not exists btree_gist with schema public;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  email text not null,
  role text not null default 'borrower' check (role in ('borrower', 'staff'))
);
create table public.equipment (
  id text primary key check (length(id) between 1 and 64),
  name text not null check (length(name) between 1 and 120),
  category text not null check (length(category) between 1 and 80),
  lab text not null check (length(lab) between 1 and 80),
  location text not null check (length(location) between 1 and 120),
  description text not null default '' check (length(description) <= 2000),
  status text not null default 'available' check (status in ('available','borrowed','maintenance'))
);
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  "equipmentId" text not null references public.equipment(id),
  "userId" uuid not null references public.profiles(id),
  date date not null,
  "startHour" integer not null,
  "endHour" integer not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled','completed')),
  "createdAt" timestamptz not null default now(),
  note text check (length(note) <= 200),
  "noteDetails" text check (length("noteDetails") <= 200),
  "handledBy" text,
  "handledAt" timestamptz,
  constraint valid_hours check ("startHour" >= 9 and "endHour" <= 17 and "endHour" > "startHour" and "endHour" - "startHour" <= 3),
  constraint no_approved_overlap exclude using gist (
    "equipmentId" with =, date with =, int4range("startHour", "endHour", '[)') with &&
  ) where (status = 'approved')
);
create index reservations_owner on public.reservations("userId");
create index reservations_equipment_date on public.reservations("equipmentId", date);

create function public.gt_handle_new_user() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  -- Client-editable metadata must never grant the staff role.
  insert into public.profiles(id, name, email, role)
  values (new.id, left(coalesce(nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1), 'User'),120), coalesce(new.email,''), 'borrower');
  return new;
end;
$$;
create trigger gt_new_auth_user after insert on auth.users
for each row execute function public.gt_handle_new_user();

create function public.gt_is_staff() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'staff');
$$;

alter table public.profiles enable row level security;
alter table public.equipment enable row level security;
alter table public.reservations enable row level security;
create policy profile_read on public.profiles for select to authenticated using (id = auth.uid() or public.gt_is_staff());
create policy equipment_read on public.equipment for select to authenticated using (auth.uid() is not null);
create policy reservation_read on public.reservations for select to authenticated using ("userId" = auth.uid() or public.gt_is_staff());
revoke all on public.profiles, public.equipment, public.reservations from anon, authenticated;
grant select on public.profiles, public.equipment, public.reservations to authenticated;

create function public.gt_assert_slot(p_date date, p_start integer, p_end integer) returns void
language plpgsql set search_path = public, pg_temp as $$
declare local_now timestamp := now() at time zone 'Europe/Istanbul';
begin
  if p_date is null or p_start is null or p_end is null or p_start < 9 or p_end > 17 or p_end <= p_start or p_end - p_start > 3 then
    raise exception 'GT:VALIDATION:Choose 1 to 3 consecutive whole hours between 09:00 and 17:00.';
  end if;
  if p_date < local_now::date or (p_date = local_now::date and p_start <= extract(hour from local_now)) then
    raise exception 'GT:PAST_SLOT:The selected slot has already started.';
  end if;
end;
$$;

create function public.gt_save_equipment(p_item jsonb, p_create boolean) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare result public.equipment;
begin
  if not public.gt_is_staff() then raise exception 'GT:FORBIDDEN:Staff permission required.'; end if;
  if p_create then
    insert into public.equipment(id,name,category,lab,location,description,status)
    values (p_item->>'id',p_item->>'name',p_item->>'category',p_item->>'lab',p_item->>'location',coalesce(p_item->>'description',''),coalesce(p_item->>'status','available'))
    returning * into result;
  else
    -- Shares the equipment row lock with booking and approval transactions.
    update public.equipment set name=p_item->>'name',category=p_item->>'category',lab=p_item->>'lab',
      location=p_item->>'location',description=coalesce(p_item->>'description',''),status=p_item->>'status'
    where id=p_item->>'id' returning * into result;
    if not found then raise exception 'GT:NOT_FOUND:Equipment not found.'; end if;
  end if;
  return to_jsonb(result);
end;
$$;

create function public.gt_create_reservation(p_input jsonb) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  item public.equipment; result public.reservations;
  slot_date date := (p_input->>'date')::date;
  slot_start integer := (p_input->>'startHour')::integer;
  slot_end integer := (p_input->>'endHour')::integer;
begin
  if not exists(select 1 from public.profiles where id=auth.uid() and role='borrower') then
    raise exception 'GT:FORBIDDEN:Use a borrower account to request equipment.';
  end if;
  perform public.gt_assert_slot(slot_date,slot_start,slot_end);
  -- Serialize mutations for one equipment item, including simultaneous requests.
  select * into item from public.equipment where id=p_input->>'equipmentId' for update;
  if not found then raise exception 'GT:NOT_FOUND:Equipment not found.'; end if;
  if item.status='maintenance' then raise exception 'GT:MAINTENANCE:Equipment is under maintenance.'; end if;
  if exists(select 1 from public.reservations r where r."equipmentId"=item.id and r.date=slot_date and r.status='approved'
    and r."startHour" < slot_end and slot_start < r."endHour") then
    raise exception 'GT:SLOT_CONFLICT:An approved booking occupies this slot.';
  end if;
  if exists(select 1 from public.reservations r where r."equipmentId"=item.id and r.date=slot_date and r.status='pending'
    and r."userId"=auth.uid() and r."startHour" < slot_end and slot_start < r."endHour") then
    raise exception 'GT:DUPLICATE_REQUEST:You already requested an overlapping slot.';
  end if;
  insert into public.reservations("equipmentId","userId",date,"startHour","endHour")
  values(item.id,auth.uid(),slot_date,slot_start,slot_end) returning * into result;
  return to_jsonb(result);
end;
$$;

create function public.gt_transition_reservation(p_id uuid, p_action text, p_note text default '', p_details text default '') returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare result public.reservations; item public.equipment; staff_name text; equipment_id text;
begin
  if auth.uid() is null then raise exception 'GT:FORBIDDEN:Sign in required.'; end if;
  select "equipmentId" into equipment_id from public.reservations where id=p_id;
  if not found then raise exception 'GT:NOT_FOUND:Reservation not found.'; end if;
  -- Lock equipment first in every mutation to keep lock order consistent.
  select * into item from public.equipment where id=equipment_id for update;
  select * into result from public.reservations where id=p_id for update;
  if p_action='cancel' then
    if result."userId" <> auth.uid() then raise exception 'GT:FORBIDDEN:Only the owner can cancel this reservation.'; end if;
    if result.status not in ('pending','approved') then raise exception 'GT:INVALID_STATE:Reservation is no longer cancellable.'; end if;
    perform public.gt_assert_slot(result.date,result."startHour",result."endHour");
    update public.reservations set status='cancelled' where id=p_id returning * into result;
  elsif p_action in ('approve','reject') then
    if not public.gt_is_staff() then raise exception 'GT:FORBIDDEN:Staff permission required.'; end if;
    if result.status <> 'pending' then raise exception 'GT:INVALID_STATE:Only pending requests can be handled.'; end if;
    select name into staff_name from public.profiles where id=auth.uid();
    if p_action='approve' then
      perform public.gt_assert_slot(result.date,result."startHour",result."endHour");
      if item.status='maintenance' then raise exception 'GT:MAINTENANCE:Equipment is under maintenance.'; end if;
      if exists(select 1 from public.reservations r where r.id<>p_id and r."equipmentId"=result."equipmentId" and r.date=result.date
        and r.status='approved' and r."startHour" < result."endHour" and result."startHour" < r."endHour") then
        raise exception 'GT:SLOT_CONFLICT:An approved booking occupies this slot.';
      end if;
      update public.reservations set status='approved',"handledBy"=staff_name,"handledAt"=now() where id=p_id returning * into result;
      update public.reservations r set status='rejected',note='Slot given to another request',"handledBy"=staff_name,"handledAt"=now()
      where r.id<>p_id and r.status='pending' and r."equipmentId"=result."equipmentId" and r.date=result.date
        and r."startHour" < result."endHour" and result."startHour" < r."endHour";
    else
      if p_note is null or length(trim(p_note))=0 or length(p_note)>200 or length(coalesce(p_details,''))>200 then
        raise exception 'GT:VALIDATION:A rejection reason of at most 200 characters is required.';
      end if;
      update public.reservations set status='rejected',note=trim(p_note),"noteDetails"=trim(coalesce(p_details,'')),
        "handledBy"=staff_name,"handledAt"=now() where id=p_id returning * into result;
    end if;
  else raise exception 'GT:VALIDATION:Invalid reservation action.';
  end if;
  return to_jsonb(result);
end;
$$;

create function public.gt_busy_slots() returns table(id uuid,"equipmentId" text,date date,"startHour" integer,"endHour" integer)
language sql stable security definer set search_path = public, pg_temp as $$
  select id,"equipmentId",date,"startHour","endHour" from public.reservations
  where status='approved' and auth.uid() is not null;
$$;

revoke all on function public.gt_handle_new_user() from public;
revoke all on function public.gt_assert_slot(date,integer,integer) from public;
revoke all on function public.gt_is_staff() from public;
revoke all on function public.gt_save_equipment(jsonb,boolean) from public;
revoke all on function public.gt_create_reservation(jsonb) from public;
revoke all on function public.gt_transition_reservation(uuid,text,text,text) from public;
revoke all on function public.gt_busy_slots() from public;
grant execute on function public.gt_is_staff(), public.gt_save_equipment(jsonb,boolean),
  public.gt_create_reservation(jsonb), public.gt_transition_reservation(uuid,text,text,text), public.gt_busy_slots() to authenticated;
commit;
