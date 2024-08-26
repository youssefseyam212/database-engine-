# database-engine-
File-Based Database System in Node.js
Overview
This project implements a simple file-based database system in Node.js, designed for lightweight
data management without the need for a full-fledged database server. The system allows for basic
CRUD (Create, Read, Update, Delete) operations and indexing on JSON data stored in local files.
Components
1. Collection Class
The Collection class is the core of this database system. It manages a collection of documents and
provides methods for various database operations.
Key Methods
Here are the main methods provided by the Collection class:
- constructor(name, db): Initializes a new collection with the specified name and references the
parent database object.
- save(): Saves the current state of the collection to a JSON file named after the collection.
- 
- read(): Reads the collection data from its corresponding JSON file.
- 
- insertOne(data): Inserts a single document into the collection, assigning it a unique _id.
- 
- insertMany(data): Inserts multiple documents into the collection, each with a unique _id.
- 
- find(query): Finds all documents matching a given query.
- 
- findOne(query): Finds the first document matching a given query.
- 
- deleteOne(query): Deletes the first document matching a given query.
- 
- deleteMany(query): Deletes all documents matching a given query.
- 
- updateOne(query, update): Updates the first document that matches a given query.
- 
File-Based Database System in Node.js

- updateMany(query, update): Updates all documents that match a given query.
- 
- createIndex(query): Creates an index based on the specified query.
- 
- readIndex(): Reads the index data from a JSON file.
- 
- saveIndex(): Saves the current index to a JSON file.
2. DB Class
- The DB class is a container for multiple collections. It provides a method to create or retrieve
- collections.
- Key Methods
- Here are the main methods provided by the DB class:
- constructor(): Initializes the database with an empty set of collections.
- collection(name): Retrieves or creates a new collection by name.
- Usage
-----------------------------------------------------------------
- 1. Initializing the Database :
       - const DB = require('./DB');
       - const db = new DB();
-------------------------------------------------------------------  
- 2. Creating a Collection :
   - const users = db.collection('users');
-------------------------------------------------------------------
- 3. Inserting Data:
       - Insert One Document:
       - users.insertOne({ name: 'Alice', age: 30 });
         -----------------------------------------------
       - Insert Multiple Documents:
- users.insertMany([{ name: 'Bob', age: 25 }, { name: 'Charlie', age: 35 }]);
---------------------------------------------------------
- 4. Querying Data : 
       - Find All Matching Documents:
       - const results = users.find({ age: 30 });
       - Find One Document:
       -  const result = users.findOne({ name: 'Alice' });
   ------------------------------------------------------
- 5. Updating Data:
       - Update One Document:
       - users.updateOne({ name: 'Alice' }, { $set: { age: 31 } });
       - Update Multiple Documents:
       - users.updateMany({ age: 30 }, { $set: { age: 31 } });
   -------------------------------------------------------
- 6. Deleting Data : 
       - Delete One Document:
       - users.deleteOne({ name: 'Alice' });
       - Delete Multiple Documents:
       - users.deleteMany({ age: 31 });
   ------------------------------------------------------
- 7. Indexing
       - Create an Index:
       - users.createIndex({ age: 25 });
   ------------------------------------------------------
- File Structure
- DB.js: The main file containing the DB and Collection classes.
- <collection_name>.json: Files generated for each collection, storing the actual data.
- <collection_name>Index.json: Files storing index data for faster querying.
- Conclusion
- This file-based database system is ideal for small projects or situations where a simple, lightweight
- database solution is needed. It offers flexibility and ease of use while providing essential database
- functionalities like CRUD operations and indexing.
