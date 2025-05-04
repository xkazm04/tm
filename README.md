Task management app for hackathon-like events

TBD demo
## Features
Simple and effective backlog management via large grid with tasks

- Admin functions for task management: State, Story Points, Categorization
- Basic task workflow
- Task completion overview


## Architecture
- UI: **NextJS**, Typescript, Tailwind 4.x with Shadcn components
- Backend: **Supabase** table with Edge **functions**
  
## Run your own project locally
### Client server
```bash
git clone tbd
npm install
npm run dev
```
### Supabase


#### Github webhook
Optional feature to synchronize PR events with the app

Github repo instructions
1. Go to `Settings > Webhooks > Add webhook`
2. Set the **Payload URL** to your **Supabase function URL**
3. Set **Content type** to `application/json`
4. Set **Secret** to the same value as ``GITHUB_WEBHOOK_SECRET`
5. Select **events**: *Pull requests* and *Pull request reviews*

Pull Request Guidelines
- All PRs should be linked to a task using one of these methods:
- Preferred: Include Task ID in PR Title
```bash
Format: `[TM-{id}] {brief description}`
Example: `[TM-abc123] Add user filtering component`
```

- Alternative: Include Task ID in PR Description

#### Impact on default workflow
The system will automatically update task status based on PR events:
- Creating a PR will change task status to "in review"  
- Approving a PR will change status to "reviewed"
- Merging a PR will change status to "completed"
