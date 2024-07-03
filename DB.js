
const{ObjectId} = require("bson")
const fs = require('fs')

class Collection{
    constructor(name , db){
        this.name = name;
         this.db = db
         if(!this.db[name]){
            this.db[name] = []
        }
         this.index = {}
    }
    save() {
        const saved = JSON.stringify(this.db[this.name], null, 2);
        fs.writeFileSync(`./${this.name}.json`, saved, err => {
            if (err) {
                console.log(err);
            } else {
                console.log("OK");
            }
        });
    }
    
    read() {
        if (fs.existsSync(`./${this.name}.json`)) {
            const output = fs.readFileSync(`./${this.name}.json`, 'utf-8');
            this.db[this.name] = JSON.parse(output);
        }
    }
    

    insertOne(data){
        this.read()
        const _id = new ObjectId()
        const newData = {_id, ...data}
        this.db[this.name].push(newData)
        this.save()
        return({
            acknowledged: true,
            insertedId: _id
        })
    }

    insertMany(data){
        this.read()
        if(!Array.isArray(data)){
            throw new Error("the input must me an array");
        }
        let insertedIds = {};
        data.forEach((item,index)=>{
            const _id = new ObjectId()
            const newData = {_id, ...item}
            this.db[this.name].push(newData)
            insertedIds[index] = _id
        })
        this.save()
        console.log({
            acknowledged: true,
            insertedIds 
        })
    }


    // //find Many

   find(query = {}){
    this.readIndex()
    if(this.index[Object.keys(query)]){
        let id = this.index[Object.keys(query)][query[Object.keys(query)]]
        this.db[this.name].filter(doc => {
            return id.every(ids => doc[id] === id)
        })
    }
    this.read();
        if(!this.db[this.name]){
            return null
        }
       return this.db[this.name].filter(doc => {
        return Object.keys(query).every(key => doc[key] === query[key])
       })
    }

    //findOne 
    findOne(query = {}){
        this.read();
        if(!this.db[this.name]){return null}
       return this.db[this.name].find(item=> {
        return Object.keys(query).every(key => item[key] == query[key])
       })
    }

    removeByAttrMany(query = {}) {
        return this.db[this.name].filter(doc =>{
            return Object.keys(query).every(key => doc[key] !== query[key])
    })
   }

    deleteMany(query = {}){
        this.read()
        let beforeDeletion = this.db[this.name].length
        this.db[this.name] = this.removeByAttrMany(query)
        let afterDeletion = this.db[this.name].length 
        this.save()
        console.log({
            acknowledged: true,
            deletedCount: beforeDeletion - afterDeletion
        })
    }


    deleteOne(query = {}){
        this.read()
        const col = this.db[this.name]
        for(let i = 0 ; i < col.length ; i++){
            let doc = col[i]
            if(Object.keys(query).every(key => doc[key] == query[key])){
                col.splice(i,1)
                this.save()
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

    updateMany(query = {} , update = {}){
       this.read()
        this.db[this.name].forEach((obj) => {
            const matches = Object.keys(query).every(key => obj[key] === query[key]) 
            if(matches){
                Object.keys(update.$set).forEach(updateKey => {
                    obj[updateKey] = update.$set[updateKey]
                })
            }
        })
        this.save()
    }
    updateOne(query = {} , update = {}){
        this.read()
        const col = this.db[this.name]
        for(let  i = 0 ; i < col.length ; i++){
            let doc = col[i]
            const matche = Object.keys(query).every(key => doc[key] === query[key]) 
            if(matche){
                for(let key in update.$set)
                {
                   col[i][key] = update.$set[key]
                }
                this.save()
                return true
            }
        }
    }

    findIndex(query = {}){
        this.read();
            if(!this.db[this.name]){
                return null
            }
           return this.db[this.name].filter(doc => {
            return Object.keys(query).every(key => doc[key] === query[key])
           })
        }

        readIndex() {
            if (fs.existsSync(`./${this.name}Index.json`)) {
                const output = fs.readFileSync(`./${this.name}Index.json`, 'utf-8');
                this.index = JSON.parse(output);
            }
        }
        createIndex(query = {}) {
            this.read();
            const data = this.findIndex(query);
            const arr = data.map(doc => doc._id);
            const keys = Object.keys(query);
            const labl = query[keys];
            this.readIndex()
            if (!this.index[keys]) {
                this.index[keys] = {};
            }
            if (!this.index[keys][labl]) {
                this.index[keys][labl] = [];
            }
            
            this.index[keys][labl] = arr           
            this.saveIndex();
        }
    saveIndex() {
        const saved = JSON.stringify(this.index, null, 2);
        fs.writeFileSync(`./${this.name}Index.json`, saved, err => {
            if (err) {
                console.log(err);
            } else {
                console.log("OK");
            }
        });
    }



}
class DB{
    constructor(){
        this.collections = {}
    }
    collection(name){
        return new Collection(name,this)
    }
}

let db = new DB()  
console.log(db.collection("Admin").find({age : 30}))


module.exports = DB

