# Database Structure

The database is build and run through mongodb.

The current structure of the database is built with a focus on being able to update it relatively easily when new updates to the regions are made. This way, we don’t need to go through every table; instead, we just handle the **Availability** table. Similarly, if any platform names or URLs are updated, we only need to update the respective table.  

The drawback is that many more rows need to be added to the **Availability** table compared to storing all information directly inside the **Entertainment** table.  

---

## Overall Structure

**Entertainment** schema keeps track of the movies and shows that exist in the database, along with their names, genres, type of entertainment, release year, and the last updated date. However, genres are not stored directly in the Entertainment schema. Instead, they are referenced by ObjectIds to the **Genre** table, which makes access to genre information quicker and easier.  

**Genre** schema stores each unique genre that exists in the database. Since genres are referenced in the **Entertainment** schema, we avoid repeating them across multiple entries. This allows us to reuse the same genre for different movies without creating duplicate data rows.  

**Platforms** schema keeps a record of the streaming platforms that are tracked and verified for availability status. This schema can be updated over time as platforms change. It allows the system to know which services need to be checked without going through every movie. If a platform shuts down, we can easily remove its entries from the **Availability** schema or filter them for easier management.  

**Availability** schema serves as the connector between the different schemas. It stores the relationship between a movie ID and the platforms on which it is (or isn’t) available, represented by a boolean value. It also stores the platform and the region, since availability often depends on geographic location. For example, a user with a VPN could query the database for a movie, check the available regions, and adjust their VPN accordingly to gain access to that content.  

---

## Overall Relationship Graph

The connection works as follows:  
- **Availability** references both **Entertainment** and **Platform** IDs.  
- **Entertainment** references **Genre** IDs.  

            Avalability
            /          \
           /            \
    Entertainment     Platforms
        |
        |
      Genre