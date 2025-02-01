import * as admin from "firebase-admin";
import { LRUCache } from "lru-cache";
import {
  Timestamp,
  PartialWithFieldValue,
  CollectionReference,
} from "firebase-admin/firestore";

const db = admin.firestore();

export default class GeneralRepository<T extends Object> {
  collectionRef: CollectionReference;
  cacheIdToData: LRUCache<string, T>;
  constructor(collection: string) {
    this.collectionRef = db.collection(collection);
    this.cacheIdToData = new LRUCache<string, T>({
      ttl: 1000 * 10,
      ttlAutopurge: true,
      allowStale: false,
      updateAgeOnGet: false,
      updateAgeOnHas: false,
    });
  }
  async fetchById(id: string, forcedUpdate?: boolean): Promise<T | undefined> {
    if (this.cacheIdToData.has(id) && !forcedUpdate) {
      return this.cacheIdToData.get(id);
    } else {
      const snapshot = await this.collectionRef.doc(id).get();
      if (snapshot.exists) {
        const data = snapshot.data() as T;
        this.cacheIdToData.set(id, data);
        return data;
      }
    }
    return;
  }
  async updateById(id: string, value: PartialWithFieldValue<T>) {
    await this.collectionRef.doc(id).update({
      editedAt: Timestamp.now(),
      ...(typeof value === "object" ? value : null),
    });
    this.cacheIdToData.delete(id);
  }
  async setById(id: string, value: PartialWithFieldValue<T>) {
    const _value = Object.assign(
      {
        id,
        createdAt: Timestamp.now(),
        editedAt: Timestamp.now(),
      },
      value
    ) as T;
    await this.collectionRef.doc(id).set(_value);
    this.cacheIdToData.set(id, _value);
    return _value;
  }
}
