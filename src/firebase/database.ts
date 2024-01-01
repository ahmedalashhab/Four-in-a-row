import { getDatabase, ref, set } from "firebase/database";

export const database = getDatabase();

export const testWriteDb = () => {
  const db = getDatabase();
  set(ref(db, 'users/' + 'id2342342'), {
    test: 'this is test data'
  });
}