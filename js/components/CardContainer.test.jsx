/* global afterEach describe expect test */
import React from 'react'

import { CardContainer } from './CardContainer'
import { ThemeProvider } from '@material-ui/styles'
import { ViewportContext, mainPaddingPlugin, widthPlugin } from '@liquid-labs/react-viewport-context'

import { act, cleanup, render } from 'react-testing-library'

// following Material UI default theme 3.9.3
const defaultTheme = {
  breakpoints : {
    keys   : ['xs', 'sm', 'md', 'lg', 'xl'],
    values : {
      'xs' : 0,
      'sm' : 600,
      'md' : 960,
      'lg' : 1280,
      'xl' : 1920,
    }
  },
  spacing : { unit : 8 },
  layout  : {
    mainPadding : {
      'xs' : {
        top    : 0,
        side   : 0,
        bottom : 0,
      },
      'sm' : {
        top    : 0.5,
        side   : 0.5,
        bottom : 0.5,
      },
      'md' : {
        top    : 0.5,
        side   : 1,
        bottom : 1,
      },
      'lg' : {
        top    : 1,
        side   : 1,
        bottom : 1,
      },
      'xl' : {
        top    : 1,
        side   : 1,
        bottom : 1,
      },
    }
  },
}

const smSpacing = 8
const smSidePadding = 2*defaultTheme.spacing.unit * defaultTheme.layout.mainPadding.sm.side
const defMinCardSize = 300

const min2Cards = defMinCardSize * 2 + smSpacing + smSidePadding

const layoutTestData = [
  //[480, 1, 7],
  //[600, 1],
  [min2Cards-1, 1, 7],
  [min2Cards, 2, 4],
  //[350*2+8+4*2, 2, 4],
]

const viewportPlugins = [widthPlugin, mainPaddingPlugin]

describe("CardContainer", () => {
  afterEach(cleanup)

  describe("with default settings", () => {
    test.each(layoutTestData)("at width %d, lays out %d cards/row in %d rows",
      (width, cardsPerRow, rowCount) => {
        window.innerWidth = width

        const { getByTestId } = render(
          <ThemeProvider theme={defaultTheme}>
            <ViewportContext plugins={viewportPlugins}>
              <CardContainer data-testid="cardContainer">
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div>6</div>
                <div>7</div>
              </CardContainer>
            </ViewportContext>
          </ThemeProvider>
        )

        const cardContainer = getByTestId('cardContainer')
        expect(cardContainer.children.length).toBe(rowCount)
        expect(cardContainer.children[0].children.length).toBe(cardsPerRow)
      })
  })
})
