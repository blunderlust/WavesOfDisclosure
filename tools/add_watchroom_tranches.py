from pathlib import Path
import json
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "js" / "uap-database.js"

# Verified by matching each archive filename against the official DVIDS search result.
JUNE = [
    ("DOW-UAP-TR4-001", "NASA-UAP-D023, Interview Excerpt with Astronaut Gordon Cooper, 1962", "1010337", "nasa-uap-d023-interview-excerpt-with-astronaut-gordon-cooper-1962"),
    ("DOW-UAP-TR4-002", "FBI-UAP-PR001_Triangle-Orbs_2021", "1010263", "fbi-uap-pr001-triangle-orbs-2021"),
    ("DOW-UAP-TR4-003", "FBI-UAP-PR003, Orbs Over the Pond, 2024", "1010267", "fbi-uap-pr003-orbs-over-pond-2024"),
    ("DOW-UAP-TR4-004", "FBI-UAP-PR002, Red Orb Rotation, Northeastern United States, 2022", "1010264", "fbi-uap-pr002-red-orb-rotation-northeastern-united-states-2022"),
    ("DOW-UAP-TR4-005", "NASA-UAP-D025, Apollo 16 Scientific Debriefing", "1010336", "nasa-uap-d025-apollo-16-scientific-debriefing"),
    ("DOW-UAP-TR4-006", "FBI-UAP-PR005, Digital Recreation, Narrative Statement 3-1, Western United States Event, 2023", "1010272", "fbi-uap-pr005-digital-recreation-narrative-statement-3-1-western-united-states-event-2023"),
    ("DOW-UAP-TR4-007", "FBI-UAP-PR006, Digital Recreation, Narrative Statement 3-2, Western United States Event, 2023", "1010276", "fbi-uap-pr006-digital-recreation-narrative-statement-3-2-western-united-states-event-2023"),
    ("DOW-UAP-TR4-008", "FBI-UAP-PR004, Northeastern Orb Sighting, 2025", "1010269", "fbi-uap-pr004-northeastern-orb-sighting-2025"),
    ("DOW-UAP-TR4-009", "NASA-UAP-D024, Apollo 16 Scientific Debriefing", "1010319", "nasa-uap-d024-apollo-16-scientific-debriefing"),
]
JULY = [
    ("DOW-UAP-TR5-001", "DOW-UAP-PR100, Unresolved UAP Report, Yellow Sea, 2023", "1014096", "dow-uap-pr100-unresolved-uap-report-yellow-sea-2023"),
    ("DOW-UAP-TR5-002", "DOW-UAP-PR101, Unresolved UAP Report, South China Sea, 2024", "1014097", "dow-uap-pr101-unresolved-uap-report-south-china-sea-2024"),
    ("DOW-UAP-TR5-003", "DOW-UAP-PR102, Unresolved UAP Report, East China Sea, 2024", "1014098", "dow-uap-pr102-unresolved-uap-report-east-china-sea-2024"),
    ("DOW-UAP-TR5-004", "DOW-UAP-PR103, Unresolved UAP Report, East China Sea, 2024", "1014099", "dow-uap-pr103-unresolved-uap-report-east-china-sea-2024"),
    ("DOW-UAP-TR5-005", "DOW-UAP-PR024, Unresolved UAP Report, Middle East, 2023", "1014100", "dow-uap-pr024-unresolved-uap-report-middle-east-2023"),
    ("DOW-UAP-TR5-006", "DOW-UAP-PR104, Unresolved UAP Report, Yellow Sea, 2025", "1014101", "dow-uap-pr104-unresolved-uap-report-yellow-sea-2025"),
    ("DOW-UAP-TR5-007", "DOW-UAP-PR030, Unresolved UAP Report, Middle East, 2023", "1014102", "dow-uap-pr030-unresolved-uap-report-middle-east-2023"),
    ("DOW-UAP-TR5-008", "DOW-UAP-PR105, Unresolved UAP Report, East China Sea, 2025", "1014103", "dow-uap-pr105-unresolved-uap-report-east-china-sea-2025"),
    ("DOW-UAP-TR5-009", "DOW-UAP-PR106, Unresolved UAP Report, Eastern United States, 2020", "1014104", "dow-uap-pr106-unresolved-uap-report-eastern-united-states-2020"),
    ("DOW-UAP-TR5-010", "DOW-UAP-PR107, Unresolved UAP Report, Eastern United States, 2020", "1014105", "dow-uap-pr107-unresolved-uap-report-eastern-united-states-2020"),
    ("DOW-UAP-TR5-011", "DOW-UAP-PR108, Unresolved UAP Report, Western United States, 2020", "1014106", "dow-uap-pr108-unresolved-uap-report-western-united-states-2020"),
    ("DOW-UAP-TR5-012", "NASA-UAP-D026, Apollo 14 Debriefing, 1971", "1014107", "nasa-uap-d026-apollo-14-debriefing-1971"),
    ("DOW-UAP-TR5-013", "DOW-UAP-PR109, Unresolved UAP Report, Eastern United States, 2015", "1014108", "dow-uap-pr109-unresolved-uap-report-eastern-united-states-2015"),
    ("DOW-UAP-TR5-014", "NASA-UAP-D027, Apollo 14 Debriefing Continued, 1971", "1014110", "nasa-uap-d027-apollo-14-debriefing-continued-1971"),
    ("DOW-UAP-TR5-015", "DOW-UAP-PR110, Unresolved UAP Report, Eastern United States, 2020", "1014112", "dow-uap-pr110-unresolved-uap-report-eastern-united-states-2020"),
    ("DOW-UAP-TR5-016", "DOW-UAP-PR111, Unresolved UAP Report, Eastern United States, 2020", "1014114", "dow-uap-pr111-unresolved-uap-report-eastern-united-states-2020"),
    ("DOW-UAP-TR5-017", "NASA-UAP-D028, Apollo 17 Crew Medical Debriefing, 1972", "1014116", "nasa-uap-d028-apollo-17-crew-medical-debriefing-1972"),
    ("DOW-UAP-TR5-018", "NASA-UAP-D029, Apollo 17 Crew Medical Debriefing Continued, 1972", "1014117", "nasa-uap-d029-apollo-17-crew-medical-debriefing-continued-1972"),
    ("DOW-UAP-TR5-019", "DOW-UAP-PR113, Unresolved UAP Report, Western United States, 1996", "1014119", "dow-uap-pr113-unresolved-uap-report-western-united-states-1996"),
    ("DOW-UAP-TR5-020", "DOW-UAP-PR114, Unresolved UAP Report, Atlantic Ocean, 2016", "1014121", "dow-uap-pr114-unresolved-uap-report-atlantic-ocean-2016"),
    ("DOW-UAP-TR5-021", "DOW-UAP-PR115, Unresolved UAP Report, Gulf of America, 2019", "1014123", "dow-uap-pr115-unresolved-uap-report-gulf-america-2019"),
    ("DOW-UAP-TR5-022", "DOW-UAP-PR116, Unresolved UAP Report, Atlantic Ocean, 2020", "1014124", "dow-uap-pr116-unresolved-uap-report-atlantic-ocean-2020"),
    ("DOW-UAP-TR5-023", "DOW-UAP-PR112, Unresolved UAP Report, Eastern United States, 2019", "1014128", "dow-uap-pr112-unresolved-uap-report-eastern-united-states-2019"),
]

def record(item, release_date, tranche):
    ident, title, vid, slug = item
    url = f"https://www.dvidshub.net/video/{vid}/{slug}"
    return {
        "id": ident,
        "title": title,
        "release_date": release_date,
        "type": "VID",
        "agency": "Department of War / AARO",
        "link": url,
        "modal_image": "",
        "description": f"Official DVIDS video record from Watch Room tranche {tranche}. The title and playback link were matched against the official DVIDS search result. This catalog entry does not independently validate the underlying UAP claim.",
        "incident_date": "",
        "incident_location": "",
        "category": "UAP-MSF",
        "agent_summary": "Officially published video record; see the source page for the agency description and media context.",
        "key_topics": ["Official source video", "UAP record", "Source-linked media"],
        "transcript_preview": "Transcript not yet prepared.",
        "dvids_video_id": vid,
        "tranche": tranche,
    }

text = DB_PATH.read_text(encoding="utf-8")
start, end = text.index("["), text.rindex("]") + 1
data = json.loads(text[start:end])
known = {x.get("dvids_video_id") for x in data}
new = [record(x, "6/12/26", "4") for x in JUNE] + [record(x, "7/10/26", "5/6") for x in JULY]
new = [x for x in new if x["dvids_video_id"] not in known]
for x in new:
    request = urllib.request.Request(x["link"], headers={"User-Agent": "Mozilla/5.0"}, method="HEAD")
    with urllib.request.urlopen(request, timeout=20) as response:
        if response.status != 200:
            raise RuntimeError(f"DVIDS link did not return 200: {x['link']} ({response.status})")
data.extend(new)
DB_PATH.write_text("/* MASTER UAP DECLASSIFIED DATABASE - COMPILED AGENTICALLY */\nconst UAP_DATABASE = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n", encoding="utf-8")
print(json.dumps({"added": len(new), "total": len(data), "new_video_ids": [x["dvids_video_id"] for x in new]}))
