Hello this is instructions for running serverless locally (Assuming you are using a Linux OS)

Notes: The node version it's running on is max 20.x as this uses v3 instead of v4(most recent) to keep everything offline 

To initialize the environment variables in shell you have to run:
    - source env.sh 
We use source rather than bash as this runs it in the shell you are using rather than an instance of the shell spun up for the command that will deinitialize after, this keeps the env vars in the session

To run the local server just run: 
    - bash local_start.sh 
This just runs the command to run it but this is shorter 
