# Admin reports: profile resignations

The profile resignation flow writes one document to `adminReports` after the
league API confirms a successful removal. Its fields follow
`src/models/adminReportModels.ts`; resignation reports use:

- `ReportType: "team_resignation"` and `ResponseType: 0` (no response action
  has been defined yet).
- `ReportedBy`: the Firebase authentication UID. `Message` contains the
  user's username; `League` and `TeamID` identify the team.
- `Phase` and `WeekID` come from the corresponding league timestamp, or are
  `null` when unavailable. SimCLAX currently has neither value in this flow.
- `Status: "pending"`, a server-generated `CreatedAt`, and null review fields.

This is a best-effort, self-reported browser event, not an authoritative audit
record. A successful resignation and its Firestore write are not atomic.
FireStore checks the user's team assignment for the six football, basketball,
and hockey leagues; SimCLAX ownership is not available in the Firestore user
document and cannot be verified by these rules. Trusted backend APIs should
eventually write authoritative reports.

The Firestore rules file and Firebase config are intentionally ignored by Git in
this repository. Before enabling the feature in an environment, apply the
rules below and the associated catch-all exclusions to the local
`firestore.rules`, then deploy those rules to the intended Firebase project.
The `users` catch-all exclusion is required because otherwise a user could
change their own admin role; it also activates the existing user-specific
access rules. The rules preserve self-resignation and forum reaction-count
updates. Client updates and deletes of admin reports are not enabled yet.

Add these helpers inside `match /databases/{database}/documents`:

```text
function safeOwnerResignation(userId) {
  let changed = request.resource.data.diff(resource.data).affectedKeys();
  return isOwner(userId)
    && changed.hasOnly([
      'teamId', 'NFLTeamID', 'NFLRole', 'cbb_id', 'NBATeamID',
      'NBARole', 'CHLTeamID', 'PHLTeamID', 'PHLRole'
    ])
    && (!changed.hasAny(['teamId']) || request.resource.data.teamId == 0)
    && (!changed.hasAny(['NFLTeamID']) || request.resource.data.NFLTeamID == 0)
    && (!changed.hasAny(['cbb_id']) || request.resource.data.cbb_id == 0)
    && (!changed.hasAny(['NBATeamID']) || request.resource.data.NBATeamID == 0)
    && (!changed.hasAny(['CHLTeamID']) || request.resource.data.CHLTeamID == 0)
    && (!changed.hasAny(['PHLTeamID']) || request.resource.data.PHLTeamID == 0)
    && (!changed.hasAny(['NFLRole']) || request.resource.data.NFLRole == '')
    && (!changed.hasAny(['NBARole']) || request.resource.data.NBARole == '')
    && (!changed.hasAny(['PHLRole']) || request.resource.data.PHLRole == '');
}

function safeReactionCountUpdate() {
  return isAuth()
    && request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['forumReactionCount'])
    && request.resource.data.forumReactionCount is int
    && (request.resource.data.forumReactionCount
          == resource.data.get('forumReactionCount', 0) + 1
      || request.resource.data.forumReactionCount
          == resource.data.get('forumReactionCount', 0) - 1);
}

function canCreateResignationReport() {
  let data = request.resource.data;
  let user = userData(request.auth.uid);
  return data.keys().hasOnly([
      'League', 'TeamID', 'ReportType', 'Message', 'ResponseType',
      'Status', 'CreatedAt', 'UpdatedAt', 'AdminResponse', 'ResolvedBy',
      'ResolvedAt', 'Phase', 'WeekID', 'ReportedBy'
    ])
    && data.keys().hasAll([
      'League', 'TeamID', 'ReportType', 'Message', 'ResponseType',
      'Status', 'CreatedAt', 'UpdatedAt', 'AdminResponse', 'ResolvedBy',
      'ResolvedAt', 'Phase', 'WeekID', 'ReportedBy'
    ])
    && data.ReportedBy == request.auth.uid
    && user.username is string
    && data.Message == user.username + ' resigned from their team.'
    && data.TeamID is int && data.TeamID > 0
    && (
      (data.League == 'SimCFB' && data.TeamID == user.get('teamId', 0))
      || (data.League == 'SimNFL' && data.TeamID == user.get('NFLTeamID', 0))
      || (data.League == 'SimCBB' && data.TeamID == user.get('cbb_id', 0))
      || (data.League == 'SimNBA' && data.TeamID == user.get('NBATeamID', 0))
      || (data.League == 'SimCHL' && data.TeamID == user.get('CHLTeamID', 0))
      || (data.League == 'SimPHL' && data.TeamID == user.get('PHLTeamID', 0))
      || data.League == 'SimCLAX'
    )
    && data.ReportType == 'team_resignation'
    && data.ResponseType == 0
    && data.Status == 'pending'
    && data.CreatedAt == request.time
    && data.UpdatedAt == null
    && data.AdminResponse == null
    && data.ResolvedBy == null
    && data.ResolvedAt == null
    && (data.Phase == null || data.Phase is int)
    && (data.WeekID == null || data.WeekID is int);
}
```

In the existing `/users/{userId}` write rule, add the following alternative
inside its existing `isAuth() && (...)` expression:

```text
|| (request.method == 'update'
    && (safeOwnerResignation(userId) || safeReactionCountUpdate()))
```

Add this collection rule:

```text
match /adminReports/{reportId} {
  allow read: if isAdmin();
  allow create: if isAuth() && canCreateResignationReport();
  allow update, delete: if false;
}
```

Finally, add both `collection != "users"` and `collection != "adminReports"`
to the existing catch-all rule's `allow read, write` condition. Firestore rules
are additive: the specific rules do not override a permissive catch-all.

Validate the rules against a disposable emulator project with:

```powershell
firebase.cmd emulators:exec --project demo-simfba-admin-reports --only firestore "node scripts\testAdminReportRules.cjs"
node --test scripts\testProfileResignation.cjs
```
