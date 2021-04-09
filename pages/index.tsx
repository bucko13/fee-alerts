import Container from "@/components/container"
import SubscribeForm from "@/components/subscribe-form"
import Logo from "@/components/logo"
import ExternalLink from "@/components/ExternalLink"

const IndexPage: React.FC = () => {
  return (
    <div>
      <Container>
        <Logo />
        <h2 className="text-center font-medium text-xl">
          Know more. Pay less. Be a good bitcoin citizen.
        </h2>
        <p>
          Sign up to be notified by email when the bitcoin fee market changes.
        </p>
        <p>
          Get an alert <strong>when fees are high</strong> to make sure you
          don't accidentally end up with a stuck transaction or pay fees higher
          than you expected.
        </p>
        <p>
          Get an alert <strong>when fees are low</strong> and save sats by
          consolidating your UTXOs. For transactions that are urgent, wait until
          the low fee alert to send rather than rush in a high fee environment.
        </p>
        <SubscribeForm />
        <div className="text-sm italic text-justify">
          <p className="my-2">
            Alerts are triggered according to{" "}
            <ExternalLink href="https://mempool.space">
              mempool.space
            </ExternalLink>
            's low priority setting checked at regular intervals throughout the
            day. If the state of the mempool has changed since the last check,
            then emails will be triggered accordingly. Only the change since the
            last check is logged and used to determine whether an alert is
            triggered.
          </p>
        </div>
        <p>Preferences can be updated at any time.</p>
        <div>
          <h3 className="font-semibold">Automation</h3>
          <p className="mt-2">
            You can add custom automation to respond to different alerts by
            plugging in to{" "}
            <ExternalLink href="https://ifttt.com">IFTT</ExternalLink>. Setup{" "}
            <ExternalLink href="https://ifttt.com/slack">
              Slack notifications
            </ExternalLink>
            , create{" "}
            <ExternalLink href="https://ifttt.com/search/query/to%20do?tab=services">
              task list reminders
            </ExternalLink>
            , even flash your{" "}
            <ExternalLink href="https://ifttt.com/wemo_lighting">
              smart light
            </ExternalLink>{" "}
            on and off in response to fee changes.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Note about privacy:</h3>
          <p className="mt-2">
            There is no personal identifying information required for this
            service. To maintain as much privacy as possible, you can access
            this form via Tor (Brave browser's{" "}
            <ExternalLink href="https://support.brave.com/hc/en-us/articles/360018121491">
              private tab
            </ExternalLink>{" "}
            is the easiest way to do this) and create a new, free email just for
            receiving the alerts. Try{" "}
            <ExternalLink href="https://protonmail.com">
              Protonmail
            </ExternalLink>{" "}
            for the best security and privacy.
          </p>
        </div>
      </Container>
    </div>
  )
}

export default IndexPage
