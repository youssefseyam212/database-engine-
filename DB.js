// DB.js
const { ObjectId } = require("bson");
const bson = require("bson")
const fs = require('fs');
const { deserialize } = require("v8");
class Collection {
    constructor(name, db) {
        this.name = name;
        this.db = db;
        if (!this.db[name]) {
            this.db[name] = [];
        }
        this.index = {};
    }
    save() {
        const dataToSave = { data: this.db[this.name] };
       const savedBson = bson.serialize(dataToSave);
        fs.writeFileSync(`./${this.name}.bson`, savedBson);
    }
    read() {
        if (fs.existsSync(`./${this.name}.bson`)) {
            const output = fs.readFileSync(`./${this.name}.bson`);
            const deserializedData = bson.deserialize(output);
            this.db[this.name] = deserializedData.data;
        }
    }
    
    insertOne(data) {
        this.read();
        const _id = new ObjectId();
        const newData = { _id, ...data };
        this.db[this.name].push(newData);
        this.save();
        return {
            acknowledged: true,
            insertedId: _id
        };
    }
    insertMany(data) {
        this.read();
        if (!Array.isArray(data)) {
            throw new Error("Input must be an array");
        }
        let insertedIds = {};
        data.forEach((item, index) => {
            const _id = new ObjectId();
            const newData = { _id, ...item };
            this.db[this.name].push(newData);
            insertedIds[index] = _id;
        });
        this.save();
        return {
            acknowledged: true,
            insertedIds 
        };
    }
    find(query = {}) {
        this.read();
        if (!this.db[this.name]) {
            return null;
        }
        this.readIndex();
        const qk = Object.keys(query); // qk -> query key
        if(this.index[qk[0]]){
            const label = query[qk[0]]
            if(this.index[qk[0]][label]){
                const ids = this.index[qk[0]][label]
                return this.db[this.name].filter(doc=>ids.includes(doc._id.toString()))
            }
        }
        else{
            return this.db[this.name].filter(doc => {
                return Object.keys(query).every(key => doc[key] === query[key]);
            });
        }
        
    }
    findOne(query = {}) {
        this.read();
        if (!this.db[this.name]) {
            return null;
        }
        return this.db[this.name].find(item => {
            return Object.keys(query).every(key => item[key] == query[key]);
        });
    }

    removeByAttrMany(query = {}) {
        return this.db[this.name].filter(doc => {
            return Object.keys(query).every(key => doc[key] !== query[key]);
        });
    }

    deleteMany(query = {}) {
        this.read();
        let beforeDeletion = this.db[this.name].length;
        this.db[this.name] = this.removeByAttrMany(query);
        let afterDeletion = this.db[this.name].length;
        this.save();
        return {
            acknowledged: true,
            deletedCount: beforeDeletion - afterDeletion
        };
    }

    deleteOne(query = {}) {
        this.read();
        const col = this.db[this.name];
        for (let i = 0; i < col.length; i++) {
            let doc = col[i];
            if (Object.keys(query).every(key => doc[key] == query[key])) {
                col.splice(i, 1);
                this.save();
                return {
                    acknowledged: true,
                    deletedCount: 1
                };
            }
        }
        return {
            acknowledged: false,
            deletedCount: 0
        };
    }

    updateMany(query = {}, update = {}) {
        this.read();
        this.db[this.name].forEach((obj) => {
            const matches = Object.keys(query).every(key => obj[key] === query[key]);
            if (matches) {
                Object.keys(update.$set).forEach(updateKey => {
                    obj[updateKey] = update.$set[updateKey];
                });
            }
        });
        this.save();
    }

    updateOne(query = {}, update = {}) {
        this.read();
        const col = this.db[this.name];
        for (let i = 0; i < col.length; i++) {
            let doc = col[i];

            const matche = Object.keys(query).every(key =>
                {
                    if(key === '_id'){
                        return doc[key].toString() === query[key].toString();
                    }
                    return doc[key] === query[key];
                }
            )
            if (matche) {
                for (let key in update.$set) {
                    col[i][key] = update.$set[key];
                }
                this.save();
                return true;
            }
        }
        return false
    }

    findIndex(query = {}) {
        this.read();
        if (!this.db[this.name]) {
            return null;
        }
        return this.db[this.name].filter(doc => {
            return Object.keys(query).every(key => doc[key] === query[key]);
        });
    }

    readIndex() {
        if (fs.existsSync(`./${this.name}.bson`)) {
            const output = fs.readFileSync(`./${this.name}.bson`);
            const deserializedData = bson.deserialize(output);
            this.index = deserializedData.data;
        }
    }

    createIndex(query = {}) {
        this.read();
        const data = this.findIndex(query);
        const arr = data.map(doc => doc._id);
        const keys = Object.keys(query);
        const label = query[keys];
        this.readIndex();
        if (!this.index[keys]) {
            this.index[keys] = {};
        }
        if (!this.index[keys][label]) {
            this.index[keys][label] = [];
        }

        this.index[keys][label] = arr;
        this.saveIndex();
    }

    saveIndex() {
        const dataSerialize = {data:this.index}
        const savedBson = bson.serialize(dataSerialize);
        fs.writeFileSync(`./${this.name}Index.bson`, savedBson);
    }
}

class DB {
    constructor() {
        this.collections = {};
    }

    collection(name) {
        return new Collection(name, this);
    }
}




module.exports = DB;
