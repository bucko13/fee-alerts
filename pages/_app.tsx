// top level component that wraps each page
import "../styles/index.css"
import Head from "next/head"

function MyApp({ Component, pageProps }) {
  return (
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
    </>
  )
}

export default MyApp
