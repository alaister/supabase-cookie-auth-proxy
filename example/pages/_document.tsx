import { Html, Head, Main, NextScript } from 'next/document'

const CustomDocument = () => {
  return (
    <Html>
      <Head />
      <body className="antialiased bg-white text-text font-inter font-feature-default">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default CustomDocument
