// Maximum of 5K events can be returned from the single query (to prevent DDOS)
const first = 5000

const EVENT_API_ROOT = 'https://tornadocash-rpc.com'

export async function fetchEvents({ netId = 1, type, currency, amount, fromBlock = 0, recent }) {
  try {
    const url = `${EVENT_API_ROOT}/${netId}/events`

    const events = []
    let lastSyncBlock = fromBlock

    // Iterate if we have more than 4.9K events
    while (true) {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          currency,
          amount,
          fromBlock,
          recent
        })
      })

      if (!resp.ok) {
        const errMsg = `${url} failed with error ${resp.status}: ${await resp.text()}`
        throw new Error(errMsg)
      }

      // eslint-disable-next-line prefer-const
      let { events: fetchedEvents, lastSyncBlock: currentBlock } = await resp.json()

      if (recent) {
        return {
          events: fetchedEvents,
          lastSyncBlock: currentBlock
        }
      }

      lastSyncBlock = currentBlock

      if (!Array.isArray(fetchedEvents) || !fetchedEvents.length) {
        break
      }

      fetchedEvents = fetchedEvents.sort((a, b) => {
        if (a.blockNumber === b.blockNumber) {
          return a.logIndex - b.logIndex
        }
        return a.blockNumber - b.blockNumber
      })

      const [lastEvent] = fetchedEvents.slice(-1)

      if (fetchedEvents.length < first - 100) {
        events.push(...fetchedEvents)
        break
      }

      fetchedEvents = fetchedEvents.filter((e) => e.blockNumber !== lastEvent.blockNumber)
      fromBlock = Number(lastEvent.blockNumber)

      events.push(...fetchedEvents)
    }

    return {
      events,
      lastSyncBlock
    }
  } catch (err) {
    console.log('Error from events api')
    console.log(err)
    return {
      events: [],
      lastSyncBlock: fromBlock
    }
  }
}
