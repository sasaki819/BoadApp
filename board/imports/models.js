import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

export const cards = new Mongo.Collection("cards");
export const connections = new Mongo.Collection("connections");

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish("cards", function cardsPublication() {
        return cards.find();
    });
    Meteor.publish("users", function usersPublication() {
        return Meteor.users.find();
    });
    Meteor.publish("connections", function connectionsPublication() {
        return connections.find({}, { sort: { timestamp: 1 } });
    });
}

Meteor.methods({
    "cards.add"(newCard) {
        check(newCard, Object);
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        newCard.createdAt = new Date();
        newCard.createdBy = Meteor.user().username;
        cards.insert(newCard);
    },
    "cards.remove"(cardId) {
        check(cardId, String);
        cards.remove(cardId);
    },
    "cards.setChecked"(cardId, setChecked) {
        check(cardId, String);
        check(setChecked, Boolean);
        cards.update(cardId, {
            $set: {
                checked: setChecked
            }
        });
    },
    "cards.update"(cardId, data) {
        check(cardId, String);
        check(data, Object);
        cards.update(cardId, {
            $set: data
        });
    },
    "ping"() {
        const connectionId = this.isSimulation ? Meteor.connection._lastSessionId : this.connection.id;
        const username = Meteor.user() ? Meteor.user().username : "";
        const timestamp = Date.now();
        connections.update(
            { connectionId, connectionId },
            {
                $set: {
                    username: username,
                    timestamp: timestamp,
                }
            },
            true
        );
    },
});