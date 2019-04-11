import React from "react"
import browserLang from "browser-lang"
import { withPrefix } from "gatsby"
import { IntlProvider, injectIntl, addLocaleData } from "react-intl"
import { IntlContextProvider } from "./intl-context"

const preferDefault = m => (m && m.default) || m

const addLocaleDataForGatsby = language => {
  try {
    addLocaleData(require(`react-intl/locale-data/${locale}`))
  } catch(e) {
    addLocaleData([{ locale: language, pluralRuleFunction: () => {} }])
  }
}

export default WrappedComponent => {
  return props => {
    const { intl } = props.pageContext
    const { language, languages, messages, redirect, routed } = intl

    /* eslint-disable no-undef */
    const isRedirect = redirect && !routed

    if (isRedirect) {
      const { pathname } = props.location

      // Skip build, Browsers only
      if (typeof window !== "undefined") {
        const detected =
          window.localStorage.getItem("gatsby-intl-language") ||
          browserLang({
            languages,
            fallback: language,
          })

        const newUrl = withPrefix(`/${detected}${pathname}`)
        window.localStorage.setItem("gatsby-intl-language", detected)
        window.location.replace(newUrl)
      }
    }

    if (typeof window !== "undefined") {
      /* 
      * You can use this to update locales client-side
      */
      if (window.___updatedLocales){
        intl.messages = window.___updatedLocales[language]
      }

      window.___gatsbyIntl = intl
    }

    addLocaleDataForGatsby(language)
    return (
      <IntlProvider locale={language} messages={messages}>
        <IntlContextProvider value={intl}>
          {isRedirect
            ? GATSBY_INTL_REDIRECT_COMPONENT_PATH &&
              React.createElement(
                preferDefault(require(GATSBY_INTL_REDIRECT_COMPONENT_PATH))
              )
            : React.createElement(injectIntl(WrappedComponent), props)}
        </IntlContextProvider>
      </IntlProvider>
    )
  }
}
