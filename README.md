

```markdown
##  AI Smart Traffic & Detour Route Assist API

Real-time municipal roadblock management and AI-driven route bypass calculation powered by Gemini AI.

---

### 1. Submit New Roadblock
Publish a new traffic obstruction, flood zone, or roadwork hazard.

* **Endpoint:** `POST /api/traffic/roadblocks`
* **Access Control:** Restricted to non-citizen roles (`field_worker`, `worker`, `dept_admin`, `super_admin`).
* **Headers:**
  ```http
  Authorization: Bearer <NON_CITIZEN_JWT_TOKEN>
  Content-Type: application/json

```

* **Sample Request Body:**
```json
{
  "title": "GEC Circle - Severe Waterlogging",
  "description": "Water depth is 1.2 meters at GEC intersection. Entire circle is closed for traffic due to heavy rainfall.",
  "cause": "waterlogging",
  "severity": "closed",
  "latitude": 22.3585,
  "longitude": 91.8215,
  "affected_radius_meters": 300,
  "department_id": 1,
  "blocked_polyline": [
    [22.3570, 91.8200],
    [22.3585, 91.8215],
    [22.3600, 91.8230]
  ]
}

```



---

### 2. Fetch Active Roadblocks

Retrieve all currently active city roadblocks affecting live traffic routing.

* **Endpoint:** `GET /api/traffic/roadblocks`
* **Access Control:** Accessible to all authenticated users.
* **Headers:**
```http
Authorization: Bearer <JWT_TOKEN>

```


* **Request Body:** *None*

---

### 3. Request AI Reroute & Detour Analysis

Request a single-pass detour calculation. Returns direct blocked route polylines, alternative bypass paths, ETA savings, and Gemini AI decision reasoning. *Disabled automatically if the target roadblock is resolved.*

* **Endpoint:** `POST /api/traffic/reroute`
* **Access Control:** Accessible to all authenticated users (including Citizens).
* **Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

```


* **Sample Request Body:**
```json
{
  "roadblock_id": "a0feb55a-97fb-4789-99fb-ea373bc9a078",
  "origin_name": "Tiger Pass Circle",
  "destination_name": "Sholashahar Railway Station",
  "origin_lat": 22.3475,
  "origin_lng": 91.8123,
  "destination_lat": 22.3650,
  "destination_lng": 91.8250
}

```



---

### 4. Toggle Roadblock Status (Active / Resolved)

Mark a roadblock as resolved once roadwork finishes or water recedes.

* **Endpoint:** `PATCH /api/traffic/roadblocks/:id/status`
* **Access Control:** Restricted to non-citizen roles (`field_worker`, `worker`, `dept_admin`, `super_admin`).
* **Headers:**
```http
Authorization: Bearer <NON_CITIZEN_JWT_TOKEN>
Content-Type: application/json

```


* **Sample Request Body:**
```json
{
  "is_active": false
}

```



```

```
