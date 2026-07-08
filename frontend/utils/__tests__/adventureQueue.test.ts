import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  discardQueueItem,
  enqueueAdventure,
  getQueue,
  markQueueItemFailed,
  QueuedAdventurePayload,
  removeFromQueue,
} from "../adventureQueue";

beforeEach(async () => {
  await AsyncStorage.clear();
});

const PAYLOAD: QueuedAdventurePayload = {
  title: "Reef Dive",
  date: "2026-07-01",
  location_name: "Blue Hole",
  latitude: 1,
  longitude: 2,
  max_depth_meters: 18,
  duration_minutes: 40,
  notes: null,
  activity_type: "scuba",
  tank_pressure_bar: null,
  gas_mix: null,
};

test("enqueueAdventure persists a pending item retrievable via getQueue", async () => {
  const item = await enqueueAdventure(PAYLOAD, []);

  expect(item.status).toBe("pending");
  expect(item.payload).toEqual(PAYLOAD);

  const queue = await getQueue();
  expect(queue).toHaveLength(1);
  expect(queue[0].localId).toBe(item.localId);
});

test("enqueueAdventure assigns each item a distinct localId", async () => {
  const first = await enqueueAdventure(PAYLOAD, []);
  const second = await enqueueAdventure(PAYLOAD, []);

  expect(first.localId).not.toBe(second.localId);
  expect(await getQueue()).toHaveLength(2);
});

test("removeFromQueue removes only the matching item", async () => {
  const first = await enqueueAdventure(PAYLOAD, []);
  const second = await enqueueAdventure({ ...PAYLOAD, title: "Second Dive" }, []);

  await removeFromQueue(first.localId);

  const queue = await getQueue();
  expect(queue).toHaveLength(1);
  expect(queue[0].localId).toBe(second.localId);
});

test("markQueueItemFailed flips status without removing the item", async () => {
  const item = await enqueueAdventure(PAYLOAD, []);

  await markQueueItemFailed(item.localId, "The server rejected this adventure.");

  const [queued] = await getQueue();
  expect(queued.status).toBe("failed");
  expect(queued.error).toBe("The server rejected this adventure.");
});

test("discardQueueItem removes a failed item entirely", async () => {
  const item = await enqueueAdventure(PAYLOAD, []);
  await markQueueItemFailed(item.localId, "rejected");

  await discardQueueItem(item.localId);

  expect(await getQueue()).toHaveLength(0);
});

test("photos are stored alongside the payload", async () => {
  const photos = [{ uri: "file:///photo.jpg", fileName: "photo.jpg", mimeType: "image/jpeg" }];
  const item = await enqueueAdventure(PAYLOAD, photos);

  expect(item.photos).toEqual(photos);
});
