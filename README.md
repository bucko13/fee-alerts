# Bitcoin Transaction Fee Alerts

A self-hosted bitcoin transaction fee alert system to receive
emails based on current mempool conditions. Uses public
[mempool.space](https://mempool.space) api endpoints for retrieving
the state of fees.

## Usage

### Requirements

- node version >12.x.x
- AWS account with RDS (postgres) and SES (email)
- Vercel for serverless deployment
