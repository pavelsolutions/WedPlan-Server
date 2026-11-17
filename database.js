import { MongoClient } from "mongodb";

const uri =
    process.env.MONGODB_URI ??
    `mongodb://${encodeURIComponent(process.env.DB_USER ?? "")}:${encodeURIComponent(process.env.DB_PASSWORD ?? "")}@ac-gzaii2b-shard-00-00.lmhje2l.mongodb.net:27017,ac-gzaii2b-shard-00-01.lmhje2l.mongodb.net:27017,ac-gzaii2b-shard-00-02.lmhje2l.mongodb.net:27017/?ssl=true&replicaSet=atlas-mherdt-shard-0&authSource=admin`;

const client = new MongoClient(uri);
let collectionsPromise;

async function createIndexes(database) {
    await Promise.all([
        database.collection("users").createIndexes([
            { key: { email: 1 }, name: "users_email_unique", unique: true },
        ]),
        database.collection("services").createIndexes([
            { key: { vendorId: 1, status: 1, createdAt: -1 }, name: "services_vendor_status_created" },
            { key: { category: 1, status: 1, location: 1 }, name: "services_category_status_location" },
        ]),
        database.collection("bookings").createIndexes([
            { key: { customerId: 1, status: 1, createdAt: -1 }, name: "bookings_customer_status_created" },
            { key: { vendorId: 1, status: 1, eventDate: 1 }, name: "bookings_vendor_status_event_date" },
            { key: { serviceId: 1 }, name: "bookings_service" },
        ]),
        database.collection("transactions").createIndexes([
            { key: { vendorId: 1, status: 1, createdAt: -1 }, name: "transactions_vendor_status_created" },
            {
                key: { stripeSessionId: 1 },
                name: "transactions_stripe_session_unique",
                unique: true,
                partialFilterExpression: { stripeSessionId: { $type: "string" } },
            },
            { key: { stripeSubscriptionId: 1 }, name: "transactions_stripe_subscription" },
        ]),
    ]);
}

export function getCollections() {
    if (!collectionsPromise) {
        collectionsPromise = (async () => {
            await client.connect();
            const database = client.db(process.env.MONGODB_DB_NAME ?? "wedPlanDB");
            await createIndexes(database);

            return {
                users: database.collection("users"),
                services: database.collection("services"),
                bookings: database.collection("bookings"),
                transactions: database.collection("transactions"),
            };
        })();
    }

    return collectionsPromise;
}

export async function closeDatabase() {
    await client.close();
    collectionsPromise = undefined;
}
