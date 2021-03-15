// top level component that wraps each page
import "../styles/index.css"

function MyApp({ Component, pageProps }) {
  return (
    <>
      <div className="font-mono">
        <Component {...pageProps} />
      </div>
    </>
  )
}

export default MyApp
