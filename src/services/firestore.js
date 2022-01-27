import { initializeApp } from "firebase/app";
import { 
    getFirestore,
    query,
    orderBy,
    onSnapshot,
    collection,
    getDoc, 
    getDocs, 
    addDoc,
    updateDoc,
    doc, 
    serverTimestamp, 
    arrayUnion
} from "firebase/firestore";
import { getAuth, signInAnonymously} from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export const authenticateAnonymously = () => {
    return signInAnonymously(getAuth(app));
};

export const createGroceryList = (userName, userId) => {
    const groceriesColRef = collection(db, 'groceryLists')
    return addDoc(groceriesColRef, {
            created: serverTimestamp(),
            createdBy: userId,
            users: [{ 
                userId: userId,
                name: userName
            }]
        });
};

export const getGroceryList = (groceryListId) => {
    const groceryDocRef = doc(db, 'groceryLists', groceryListId)
    return getDoc(groceryDocRef);
};

export const getGroceryListItems = (groceryListId) => {
    const itemsColRef = collection(db, 'groceryLists', groceryListId, 'items')
    return getDocs(itemsColRef)
}

export const streamGroceryListItems = (groceryListId, snapshot, error) => {
    const itemsColRef = collection(db, 'groceryLists', groceryListId, 'items')
    const itemsQuery = query(itemsColRef, orderBy('created'))
    return onSnapshot(itemsQuery, snapshot, error);
};

export const addUserToGroceryList = (userName, groceryListId, userId) => {
    const groceryDocRef = doc(db, 'groceryLists', groceryListId)
    return updateDoc(groceryDocRef, {
            users: arrayUnion({ 
                userId: userId,
                name: userName
            })
        });
};

export const addGroceryListItem = (item, groceryListId, userId) => {
    return getGroceryListItems(groceryListId)
        .then(querySnapshot => querySnapshot.docs)
        .then(groceryListItems => groceryListItems.find(groceryListItem => groceryListItem.data().name.toLowerCase() === item.toLowerCase()))
        .then( (matchingItem) => {
            if (!matchingItem) {
                const itemsColRef = collection(db, 'groceryLists', groceryListId, 'items')
                return addDoc(itemsColRef, {
                        name: item,
                        created: serverTimestamp(),
                        createdBy: userId
                    });
            }
            throw new Error('duplicate-item-error');
        });
};