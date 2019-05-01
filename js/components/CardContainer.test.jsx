/* global afterEach describe expect test */
import React from 'react'

import { CardContainer, floorTo12Factor, getSpacing, hasNext } from './CardContainer'
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

const min2Cards = 2 * defMinCardSize + smSpacing + smSidePadding
// TODO: if we can abstract and then import the constants, we could drop these tests.
test('min2Cards constants match', () => expect(min2Cards).toBe(616))
const pref4Cards = 4 * defPrefCardSize + 3 * lgSpacing + lgSidePadding
test('pref4Cards constants match', () => expect(pref4Cards).toBe(1344))
// Enough for 2 min cards, with a little room to spare, but not enough for 2 preferred card sizes
const minCardTrigger = 2 * defMinCardSize + (defPrefCardSize - defMinCardSize) + 2 * smSpacing + smSidePadding
test('minCardTrigger constants match', () => expect(minCardTrigger).toBe(600+20+16+8))

const layoutTestData = [
  [min2Cards-1, 1, 7],
  [min2Cards, 2, 4],
  [pref4Cards-1, 3, 3],
  [pref4Cards, 4, 2],
  [minCardTrigger, 2, 4],
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

    test(`at width ${pref4Cards}, balances 10 cards in rows of 4, 4, and 2`, () => {
      window.innerWidth = pref4Cards

      const cardContainer = standardTestSetup(pref4Cards, 10)
      expect(cardContainer.children.length).toBe(3)
      expect(cardContainer.children[0].children.length).toBe(4)
      expect(cardContainer.children[1].children.length).toBe(4)
      expect(cardContainer.children[2].children.length).toBe(2)
    })

    test(`at width ${pref4Cards}, balances 5 cards in rows of 3 and 2`, () => {
      window.innerWidth = pref4Cards

      const cardContainer = standardTestSetup(pref4Cards, 5)
      expect(cardContainer.children.length).toBe(2)
      expect(cardContainer.children[0].children.length).toBe(3)
      expect(cardContainer.children[1].children.length).toBe(2)
    })
  })

  describe("issues warning if", () => {
    test("'width' not availble when 'layoutToBreakpoint' is false (default)", () =>{
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

    test("child is missing a key", () => {
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
})

const floorTo12FactorData = [
  [ 100, 12 ],
  [ 13, 12 ],
  [ 12, 12 ],
  [ 11, 6 ],
  [ 7, 6 ],
  [ 6, 6 ],
  [ 5, 4 ],
  [ 4, 4 ],
  [ 3, 3 ],
  [ 2, 2 ],
  [ 1, 1 ],
]
describe("floorTo12Factor", () => {
  test.each(floorTo12FactorData)("%d -> %d", (input, floor) =>
    expect(floorTo12Factor(input)).toBe(floor))
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
  test.each(spacingData)("expects %s: '%p' to resolve to %s", (desc, value, expected) =>
    expect(getSpacing('sm', 8, value)).toBe(expected))
})

describe("hasNext", () => {
  const hasNextData = [
    [1, 2, 1, 1],
    [2, 3, 2, 1],
    [2, 4, 2, 2],
    [3, 4, 3, 1],
    [3, 5, 3, 2],
    [3, 6, 3, 3],
    [4, 5, 3, 2],
    [4, 6, 4, 2],
    [4, 7, 4, 3],
    [4, 8, 4, 4],
    [5, 6, 4, 2],
    [5, 7, 4, 3],
    [5, 8, 5, 3],
    [6, 7, 4, 3],
    [6, 8, 5, 3],
    [6, 9, 5, 4],
    [6, 10, 6, 4],
  ]
  test.each(hasNextData)("@ %d cards/row, with %d cards left, balances final rows %d/%d",
      (cardsPerRow, cardsLeft, penultimateCount, ultimateCount)=> {
    expect(hasNext(true, 2, 3, penultimateCount - 1, cardsPerRow, ultimateCount + 1)).toBe(true)
    expect(hasNext(true, 2, 3, penultimateCount, cardsPerRow, ultimateCount)).toBe(false)
  })

  const evenTwoRowBalanceData = [
    [3, 4],
    [4, 6],
    [5, 6],
    [5, 8],
    [6, 8],
    [6, 10],
  ]
  test.each(evenTwoRowBalanceData)("with 2 rows total @ %d cards/row, will divide %d cards evenly",
      (cardsPerRow, totalCards) => {
    const expectCardsPerRow = totalCards / 2
    expect(hasNext(true, 1, 2, expectCardsPerRow - 1, cardsPerRow, expectCardsPerRow + 1)).toBe(true)
    expect(hasNext(true, 1, 2, expectCardsPerRow, cardsPerRow, expectCardsPerRow)).toBe(false)
  })

  const oddTwoRowBalanceData = [
    [3, 5, 3, 2],
    [4, 5, 3, 2],
    [5, 7, 3, 2],
    [5, 9, 5, 4],
    [6, 7, 4, 3],
    [6, 9, 5, 4],
    [6, 11, 6, 5],
  ]
  test.each(oddTwoRowBalanceData)("with 2 rows total @ %d cards/row, will divide %d cards in rows of %d/%d",
      (cardsPerRow, totalCards, penCount, ultCount) => {
    expect(hasNext(true, 1, 2, penCount - 1, cardsPerRow, ultCount + 1)).toBe(true)
    expect(hasNext(true, 1, 2, penCount, cardsPerRow, ultCount)).toBe(false)
  })
})
