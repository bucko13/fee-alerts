# Bitcoin Transaction Fee Alerts

A self-hosted bitcoin transaction fee alert system to receive
emails based on current mempool conditions. Uses public
[mempool.space](https://mempool.space) api endpoints for retrieving
the state of fees.

A publicly deployed version of this application is available at
[txfees.watch](https://txfees.watch). If you'd like to run your own
private version, either to avoid sharing an email address or to change
the alert trigger frequency and amounts, you can follow the instructions
below.

If you run into any problems either at [txfees.watch](https://txfees.watch)
or with your own deployed version, please file an issue [on GitHub](https://github.com/bucko13/fee-alerts/issues).

## Architecture

The application is made up of the following pieces:

1. **The API** is a serverless deployment using [Vercel](https://vercel.com). This lets
   you easily deploy a publicly available API, for free directly from your local computer
   or from a GitHub repo.

1. **The site** (which is only composed of two pages) is also served from Vercel using their
   SSR Next.js framework. The API and webapp are served together in the same command.

1. **Postgresql Database** - This is for storing the subscription information and
   historical fee data to determine if alerts are triggered or not. The app assumes
   use of [AWS's RDS service](https://aws.amazon.com/rds/) which has a free tier.

1. **Emails** are sent using using AWS' [Simple Email Service](https://aws.amazon.com/ses/) (SES).
   The free, sandbox tier allows you to send to and from verified emails. If you're only using
   this for personal use, then that should be sufficient (and free). Otherwise, you will have to
   apply for an upgrade to the account.

1. **GitHub Actions** is used for scheduling the status checks. The configurations are housed
   in the repo and picked up by GitHub automatically, which triggers a ping to the (protected) API
   endpoint hosted with Vercel at regular intervals (based on the configuration) to check the fees and
   send any relevant emails.

### Front End Architecture

User -> Vercel serves Next.js files -> User enters email and preferences -> info is saved in DB on AWS

### Alerts Architecture

GitHub Actions triggered (either manually or via scheduler) ->
serverless endpoint hit ->
calls mempool.space to check current fees ->
serverless function determines emails that need to be sent based on previous check ->
AWS SES sends emails (if necessary)

## Self-hosted instructions

### Requirements

- node version >12.x.x
- AWS account with RDS (postgres) and SES (email)
- Vercel account for serverless deployment

### Setup

These instructions are a little vague, particularly if you're not familiar with
the tools. If you run into any problems, leave a question in the GitHub
issues and I can try and address them with more details.

#### The Code

- Fork a copy of this repo for yourself
- Clone the repo to your local machine (currently, this is necessary to deploy
  the email templates)

#### AWS - RDS

- Create an AWS account if you don't have one
- Add SES and RDS services to your account
- In RDS create a new Postgresql database
- Take note of the endpoint, port, user, and password for later
- You'll need to create a database in this instance that will be responsible for
  storing the subscription and fee information. Using [psql](https://www.postgresql.org/docs/9.2/app-psql.html)
  on your local machine using AWS credentials and the relevant DB conneciton details is one way to do this.
- Setup a security group to allow inbound connections to your database.
- Get the connection details (database URL) for your db. It will look something like this:
  "postgresql://[USER]:[PASSWORD]@[ENDPOINT]:[PORT]/[DB_NAME]"

#### AWS - SES

- In the service on AWS, add and verify some emails. Ideally you can do this with a domain
  you own which adds extra verifications to avoid emails going to spam, but
  any email should work (especially for testing)
- You'll need to create an IAM identity group without multi-factor authentication DISABLED
  and a corresponding access key id and secret. Save these for later (the secret is only shown once!)
- Setup AWS' CLI tool on your local machine.
- `cd` to the `/lib/templates` directory locally.
- Run these commands to add the email templates to your account:

```
aws ses create-template --cli-input-json file://confirmation-template.json
aws ses create-template --cli-input-json file://ltlow-template.json
aws ses create-template --cli-input-json file://gtlow-template.json
aws ses create-template --cli-input-json file://lthigh-template.json
aws ses create-template --cli-input-json file://gthigh-template.json
```

Once this is done, you don't need to keep the code on your computer anymore.

#### Generate an API key

This is to protect your `/api/fees` endpoint so that only your application
can trigger a check.

This can be whatever you want, but to create a secure (read: hard to guess) API key,
you can run the node script provided in this repo:

```
node scripts/generate-key.js
```

#### Vercel

- Create an account
- Connect it to your GitHub account and add your fork of the repo.
  This will trigger deploys anytime a change is pushed to a branch
  (these settings can be adjusted if desired).
- Every deploy will be associated with a deployment URL. This is what
  we'll refer to as the `API_ORIGIN` which will be needed later. This
  is where your site can be viewed (live on the world wide web) and where
  your API endpoints can be hit. There is also a persistent "production"
  deployment URL that can (and should) be used.
- In Vercel, you're going to want to set up a bunch of Secrets/Environment
  Variables so that your app knows how to communicate with the various pieces
  of the architecture. Save them with the following names as _SECRETS_ (not
  plaintext) and using the values according to what you collected in the
  previous steps:

  - DATABASE_URL
  - AWS_SES_REGION
  - AWS_SES_SECRET_ACCESS_KEY
  - AWS_SES_ACCESS_KEY_ID
  - FEES_API_KEY (generated in the previous section)

- These are optional environment variables that can be saved as plaintext:
  - API_ORIGIN (where the production site will be, this is used in email templates)
  - HIGH_FEE (the "high fee" trigger- defaults to 50)
  - LOW_FEE (the "low fee" trigger- defaults to 10)
  - MAX_RECORDS (how many mempool entries to save- defaults to 100)

All of these secrets can also be set in a `.env` file in order to develop
or deploy locally.

#### GitHub Actions

In your fork's repo, go to settings and add the following repository secrets:

- API_ORIGIN
- FEES_API_KEY

The first is the origin of where your api can be accessed. For example
https://txfees.watch (no trailing slash).

The second is the key you generated above.

NOTE: Set these as repository secrets NOT Environment secrets. This is done by
going to "Settings" in your repo, then "Secrets" in the sidebar, "Actions
secrets", then clicking "New repository secret".

### Customizing alert frequency

If you would like to customize the frequency with which the state of the mempool
is checked, you can update the GitHub Action configuration in `.github/workflows/cron.yml`

Simply update `on.schedule.cron` value to a valid cron string matching
the frequency you want it to run.

### Testing that everything works

You can use the manual GitHub Action trigger to test if everything is working properly.

- Check that Vercel deployed without errors from your Vercel dashboard
- Sign up with a validated SES email at the deployment url from Vercel
- Check that you received the confirmation email
- Check that the profile URL works from the confirmation email
- Make sure you're signed up for all alert versions (so that you can see
  you receive when at least one is triggered)
- Go to your repo on GitHub > Actions > Select Workflow > Check mempool state > Run workflow

You can also check by using `curl` locally running the same command as in
the GitHub action yml file or from Postman (making sure to pass the FEES_API_KEY
in an Authorization header in either case).
