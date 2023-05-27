.. _ep-migrate-troubleshooting-content-troubleshooting:

Investigating Issues
====================

If the CLI reports issues, you can find the details in the log file.

For example, the CLI reports two issues:


.. code-block:: bash

    ------------------------------------------------------------------------------------------------    
    Issues for run: present
    
      Log file: {path}/logs/ep-migrate.log  
      
      EpV1 Migrate Schema Issues: 
        
          - EpV1: Application Domain: EP_MIGRATE/TEST, Schema: SchemaWithIssue (issueId: myh72KUHCuHoAdj2iwGiUZ)  
      
      EpV1 Migrate Event Issues: 
      
        - EpV1: Application Domain: EP_MIGRATE/TEST, Event: EventWithIssue (issueId: aZc2aQyLYcm1PfNxwDe8io)
      
Copy the Event issue Id (aZc2aQyLYcm1PfNxwDe8io) and search for the occurrences in the log file.

In this case, the issue with the Event is caused by the issue of the referenced schema.

The log file will show the root cause of the Event issue to be an issue in the referenced schema.

