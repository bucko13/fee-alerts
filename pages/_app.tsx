// top level component that wraps each page
import "../styles/index.css"
import Head from "next/head"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import Footer from "@/components/Footer"
import ExternalLink from "@/components/ExternalLink"

type MyAppProps = {
  Component: React.ComponentType
  pageProps: Record<string, unknown>
}

const MyApp: React.FC<MyAppProps> = ({ Component, pageProps }) => (
  <>
    <Head>
      <title>Bitcoin Fee Alerts</title>
      <meta property="og:title" content="Bitcoin Fee Alerts" key="title" />
      <meta
        name="description"
        content="Signup for alerts about changing fee conditions on the bitcoin network"
      />
    </Head>
    <div className="font-mono">
      <Component {...pageProps} />
    </div>
    <Footer>
      <ExternalLink href="https://github.com/bucko13/fee-alerts">
        <FontAwesomeIcon
          icon={faGithub}
          size="2x"
          className="text-gray-500 hover:text-black cursor-pointer"
        />
      </ExternalLink>
    </Footer>
  </>
)

export default MyApp
