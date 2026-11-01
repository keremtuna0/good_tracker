# M2 risk register — 1 November 2026

This carries forward the M1 risks and adds the two planning gaps identified during M2. Open means a response is planned; it does not mean a test has been run.

| ID | Risk | Probability | Impact | Priority | Mitigation / response | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | Exams and coursework reduce project time. | High | Medium | High | Use the confirmed 5–6 hours per person per week as a ceiling; update weekly capacity before committing tasks. | Kardelen | Open |
| R-02 | Supabase free-tier limits affect development or demo. | Medium | High | High | Validate with a small prototype by the internal 8 November target and monitor usage. | Kerem | Open |
| R-03 | Concurrent requests produce overlapping reservations. | Medium | High | High | Enforce the conflict rule in the data layer and test simultaneous requests on a named build. | Kardelen | Open |
| R-04 | Android layouts vary across devices. | Medium | Medium | Medium | Test core screens on at least two screen sizes before the demo. | Talha | Open |
| R-05 | Mobile work waits for the API contract. | Medium | High | High | Share initial request/response examples during the data-model work; use sample data until endpoints are ready. | Kerem | Open |
| R-06 | Extra features delay the Must reservation flow. | Medium | Medium | Medium | Implement Must items first; defer the Could reminder if capacity is tight. | Kardelen | Open |
| R-07 | Product items lack GitHub issue links. | High | Low | Medium | Issues #33–#39 were created and TSK-08 maps to #18 and #21. Keep links current as scope changes. | Talha | Resolved for M2 backlog on 1 November. |
| R-08 | Effort estimates differ from actual work. | High | Medium | High | Record actual hours weekly and reforecast; review the 141.5-hour working allocation after the first sprint. | Kerem | Open |
| R-09 | Official M3–M5 deadlines differ from internal target dates. | Medium | High | High | Check DYS when each milestone opens; revise dates and scope before committing sprint goals. | Kardelen | Open |

Probability and impact are planning judgements. No risk is recorded as resolved without a dated observation or test result.
