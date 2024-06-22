
const{ObjectId} = require("bson")
const fs = require('fs')

class Collection{
    constructor(name , db){
        this.name = name;
         this.db = db
         if(!this.db[name]){
            this.db[name] = []
        }
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


    sort(input = {}){
        
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
        console.log({
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
}
class DB{
    constructor(){
        this.collections = {}
    }
    collection(name){
        return new Collection(name,this)
    }
}
module.exports = DB
