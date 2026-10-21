# 5. Initial Success Criteria

| Area | Criterion | How it will be verified |
| :--- | :--- | :--- |
| **Product** | **Reservation Conflicts:** System strictly prevents double-booking of the same equipment for overlapping time periods. | We will send simultaneous reservation requests for the same slot and verify that the backend rejects the second attempt. |
| **Product** | **Authorization:** Regular users can only request/cancel their own bookings, staff can approve/reject requests or manage equipments. | We will attempt staff-only actions using non-staff account tokens and confirm the API returns a 403 Forbidden error. |
| **Product** | **End-to-End Reservation Flow:** Users can log in, browse an equipment, check real-time availability and submit reservations. | We will manually test the reservation process on an Android device/emulator from login to submission. |
| **Project management** | **Scope Control:** Demo remains focused on Android mobile client, Node.js API, and Supabase backend without scope creep. | We will check our completed backlog items against the original M1 requirements list. |
| **Quality** | **Code Review & Control:** Our team members review and check all code updates on GitHub. | We will check git commit history and peer review logs on GitHub before finalizing milestone deliverables. |


## Individual Contribution (M1)
I defined the functional, management, and quality success criteria for GoodTracker. I have established verification steps for each target which helped us organie our M1 planning docs.