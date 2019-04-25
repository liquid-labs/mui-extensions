/* global afterEach describe expect test */
import React from 'react'

import { CardContainer, getSpacing } from './CardContainer'
import { ThemeProvider } from '@material-ui/styles'
import { ViewportContext, mainPaddingPlugin, widthPlugin } from '@liquid-labs/react-viewport-context'

import { act, cleanup, render } from 'react-testing-library'

import * as msgs from '../msgs'

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
const lgSpacing = 8 * 2
const lgSidePadding = 2*defaultTheme.spacing.unit * defaultTheme.layout.mainPadding.lg.side
const defMinCardSize = 300
const defPrefCardSize = 320

const min2Cards = defMinCardSize * 2 + smSpacing + smSidePadding
const pref4Cards = defPrefCardSize * 4 + lgSpacing * 3 + lgSidePadding

const layoutTestData = [
  //[480, 1, 7],
  //[600, 1],
  [min2Cards-1, 1, 7],
  [min2Cards, 2, 4],
  [pref4Cards-1, 3, 3],
  [pref4Cards, 4, 2],
  //[350*2+8+4*2, 2, 4],
]

const viewportPlugins = [widthPlugin, mainPaddingPlugin]

const standardTestSetup = (width, childCount) => {
  const children = []
  for (let i = 0; i < childCount; i += 1)
    children.push(<div key={i}>{i}</div>)
  const { getByTestId } = render(
    <ThemeProvider theme={defaultTheme}>
      <ViewportContext plugins={viewportPlugins}>
        <CardContainer data-testid="cardContainer">
          { children }
        </CardContainer>
      </ViewportContext>
    </ThemeProvider>
  )

  return getByTestId('cardContainer')
}

describe("CardContainer", () => {
  afterEach(cleanup)

  describe("with default settings", () => {
    test.each(layoutTestData)("at width %d, lays out 7 cards %d cards/row in %d rows",
      (width, cardsPerRow, rowCount) => {
        window.innerWidth = width

        const cardContainer = standardTestSetup(width, 7)
        expect(cardContainer.children.length).toBe(rowCount)
        expect(cardContainer.children[0].children.length).toBe(cardsPerRow)
      })

    test(`at width ${pref4Cards}, balances 6 cards in two rows of 3`, () => {
      const cardContainer = standardTestSetup(pref4Cards, 6)
      expect(cardContainer.children.length).toBe(2)
      expect(cardContainer.children[0].children.length).toBe(3)
      expect(cardContainer.children[1].children.length).toBe(3)
    })

    test(`at width ${pref4Cards}, balances 5 cards in rows of 3 and 2`, () => {
      const cardContainer = standardTestSetup(pref4Cards, 5)
      expect(cardContainer.children.length).toBe(2)
      expect(cardContainer.children[0].children.length).toBe(3)
      expect(cardContainer.children[1].children.length).toBe(2)
    })
  })

  test("issues warning if 'width' not availble when 'layoutToBreakpoint' is false (default)", () =>{
    const spy = jest.spyOn(console, 'warn').mockImplementation(jest.fn())
    const { getByTestId } = render(
      <ThemeProvider theme={defaultTheme}>
        <ViewportContext plugins={[mainPaddingPlugin]}>
          <CardContainer data-testid="cardContainer">
            <div key="1">1</div>
          </CardContainer>
        </ViewportContext>
      </ThemeProvider>
    )

    const cardContainer = getByTestId('cardContainer')
    expect(spy).toHaveBeenCalledWith(msgs.noWidthLayoutWarning)

    spy.mockRestore()
  })

  test("issues warning if child is missing a key", () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(jest.fn())
    const supress = jest.spyOn(console, 'error').mockImplementation(jest.fn())

    const child = <div>1</div>
    const { getByTestId } = render(
      <ThemeProvider theme={defaultTheme}>
        <ViewportContext plugins={viewportPlugins}>
          <CardContainer data-testid="cardContainer">
            {child}
          </CardContainer>
        </ViewportContext>
      </ThemeProvider>
    )

    const cardContainer = getByTestId('cardContainer')
    expect(spy).toHaveBeenCalledWith(msgs.warnChildKey, child)

    spy.mockRestore()
    supress.mockRestore()
  })
})

const spacingData = [
  ['string', '2px', '2px'],
  ['default spacing', undefined, 8],
  ['spacing map to unit', { sm : 1 }, 8],
  ['spacing map to string', { sm : '1em' }, '1em'],
  ['function returning unit', () => 1, 8],
  ['function returning string', () => '1px', '1px'],
]

describe("getSpacing", () => {
  test.each(spacingData)("expects %s: '%p' to resolve to %s", (desc, value, expected) => {
    expect(getSpacing('sm', 8, value)).toBe(expected)
  })
})
