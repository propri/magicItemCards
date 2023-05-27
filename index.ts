import magicItems from './magic_items.json'
import fs from 'fs'

type Item = {
  name: string
  description: string
  category: string
  image?: string
  rarity: string
  cost: number
  weight: number
  classification?: string
  ac?: string
  properties?: string
  count?: number
  source: string
  id: number
}

const {
  items,
}: {
  items: Item[]
} = magicItems.pageProps.sourceTable

const keyValueOverview = {
  category: new Map<string, number>(),
  image: new Map<string, number>(),
  rarity: new Map<string, number>(),
  classification: new Map<string, number>(),
  keys: new Set<string>(),
}

for (let item of items) {
  for (let key in item) {
    keyValueOverview.keys.add(key)
  }
  if (!keyValueOverview.category.has(item.category)) {
    keyValueOverview.category.set(item.category, 0)
  }
  keyValueOverview.category.set(
    item.category,
    keyValueOverview.category.get(item.category)! + 1
  )
  const image = item?.image ?? 'unknown'
  if (!keyValueOverview.image.has(image)) {
    keyValueOverview.image.set(image, 0)
  }
  keyValueOverview.image.set(image, keyValueOverview.image.get(image)! + 1)
  if (!keyValueOverview.rarity.has(item.rarity)) {
    keyValueOverview.rarity.set(item.rarity, 0)
  }
  keyValueOverview.rarity.set(
    item.rarity,
    keyValueOverview.rarity.get(item.rarity)! + 1
  )
  const classification = item?.classification ?? 'unknown'
  if (!keyValueOverview.classification.has(classification)) {
    keyValueOverview.classification.set(classification, 0)
  }
  keyValueOverview.classification.set(
    classification,
    keyValueOverview.classification.get(classification)! + 1
  )
}

/* nur magische Gegenstände */
const blackList = [
  /* Kein magischer Gegenstand */
  'Plattenrüstung',
  'Schienenpanzer',
  'Fernglas',

  /* Titel zu lang */
  'Dämpfe einer verbrannten Othure',
  'Helm des Sprachenverstehens',
  'Dreizack der Fischherrschaft',
  'Zweihandschwert des Lebensentzugs',
  'Kurzschwert des Lebensentzugs',
  'Armschienen des Bogenschießens',
  'Zauberstab der Magieerkennung',
  'Verzaubertes beschlagenes Leder',
  'Handschuhe des Schwimmens und Kletterns',

  /* Text zu lang */
  'Staub der Trockenheit (1 Kügelchen)',
  'Federmarke Peitsche',
  'Perle der Kraft',
  'Ioun-Stein der Ernährung',
  'Wurfspeer des Blitzes',
  'Verwundender Dolch',
  'Seil des Kletterns',

  /* Titel und Text zu lang */
  'Figur der wundersamen Kraft (Goldene Löwen)',
]

const magic = items
  .filter(
    (item) =>
      /* nur uncommon + rare Gegenstände */
      item.rarity !== 'Mundän' &&
      item.rarity !== 'Gewöhnlich' &&
      item.rarity !== 'Legendär' &&
      item.rarity !== 'Sehr Selten'
  )
  /* aus diversen Gründen ausgeschlossene Gegenstände */
  .filter(({ name }) => !blackList.includes(name))
  /* Ioun-Steine haben zuviel Boilerplate Text, als dass sie auf die Karten passen */
  .filter(({ name }) => name.match(/^Ioun-Stein/))

//{
//category: Map(9) {
//'Rüstung' => 27,
//'Waffe' => 74,
//'Abenteuerausrüstung' => 95,
//'Werkzeuge' => 35,
//'Gifte' => 14,
//'Tränke und Öle' => 23,
//'Wundersame Gegenstände' => 174,
//'Wondrous Item' => 1,
//'Anderes' => 98
//},

//classification: Map(10) {
//'Leichte Rüstung' => 5,
//'Mittelschwere Rüstung' => 9,
//'Schwere Rüstung' => 8,
//'Schild' => 5,
//'Einfache Nahkampfwaffe' => 19,
//'Einfache Fernkampfwaffe' => 5,
//'Nahkampfs-Kriegswaffen' => 36,
//'Fernkampfs-Kriegswaffen' => 6,
//'unknown' => 447,
//'Nahkampfwaffe' => 1
//},

const colorMatching: Record<string, string> = {
  Rüstung: 'dimgray',
  Waffe: 'dimgray',
  Abenteuerausrüstung: 'saddlebrown',
  Werkzeuge: 'Peru',
  Gifte: 'ForestGreen',
  'Tränke und Öle': 'Maroon',
  'Wundersame Gegenstände': 'indigo',
  'Wondrous Item': 'indigo',
  Anderes: 'indianred',
}

const getIcon = (item: Item) => {
  if (item.category === 'Rüstung') {
    switch (item.classification) {
      case 'Leichte Rüstung':
        return 'leather-vest'
      case 'Mittelschwere Rüstung':
        return 'lamellar'
      case 'Schwere Rüstung':
        return 'breastplate'
      case 'Schild':
        return 'round-shield'
      default:
        return 'footprint'
    }
  }

  if (item.category === 'Waffe') {
    switch (item.classification) {
      case 'Einfache Nahkampfwaffe':
        return 'plain-dagger'
      case 'Nahkampfs-Kriegswaffen':
        return 'battle-axe'
      case 'Einfache Fernkampfwaffe':
        return 'bow-arrow'
      case 'Fernkampfs-Kriegswaffen':
        return 'crossbow'
      default:
        return 'footprint'
    }
  }

  if (item.category === 'Abenteuerausrüstung') {
    return 'knapsack'
  }

  if (item.category === 'Werkzeuge') {
    return 'hammer-nails'
  }

  if (item.category === 'Gifte') {
    return 'poison-bottle'
  }

  if (item.category === 'Tränke und Öle') {
    return 'drink-me'
  }

  if (item.category === 'Wundersame Gegenstände') {
    return 'magic-lamp'
  }

  return 'perspective-dice-six-faces-random'
}

const getProperties = (item: Item) => {
  if (!item?.properties) {
    return []
  }

  return [`subtitle | ${item.properties.replace(/\|/g, '-')}`, 'rule']
}

//const getSubtitle = (item: Item) =>
//`subtitle | ${item.classification ? `${item.classification} ` : ''}(${
//item.cost / 100
//} Gold)`

const cleanDescription = (description: string) =>
  description
    .replace(/\[([^\]]+)\]/g, (_, tagName) => `<b>${tagName}</b>`)
    .replace(/(\d+)d(\d+)/g, (_, nrDice, valueDice) => `${nrDice}W${valueDice}`)
    .replace(/DC/g, 'SG')

const getCount = (item: Item) => {
  if (item.count !== undefined) {
    return item.count
  }
  return item.category === 'Tränke und Öle' && item.name.match(/[Hh]eil/)
    ? 4
    : 1
}

const transformed = magic.map((item) => ({
  count: getCount(item),

  color: colorMatching[item.category],
  title: item.name,
  icon: getIcon(item),
  //contents: [getSubtitle(item), 'rule', `description || ${item.description}`],
  //contents: [`description || ${item.description}`],
  contents: [
    ...getProperties(item),
    'fill',
    `text | ${cleanDescription(item.description)}`,
    'fill',
  ],
}))

fs.writeFileSync('out.json', JSON.stringify(transformed))

//console.log(keyValueOverview)