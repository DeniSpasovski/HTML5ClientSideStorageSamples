Indexed DB Samples
================

The project contains unit tests and sample functions for the IndexedDB API, separated into two test pages. The tests are written using the QUnit library.

First page 'IndexedDbSample' covers all the basic IndexedDB API functions:
 - create object store
 - index object store
 - insert 
 - count 
 - search  
 - delete 

The second page 'BigDataSample' contains tests for inserting a large data set into the database and it measures the search performance. 
With default settings the test inserts 100 000 rows, using 4 web workers.
   
