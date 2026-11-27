# Control files

`control/stop` is the kill switch. Create that file in this repository and
commit it: the current run finishes, records its heartbeat and does not queue
another run. Delete the file and dispatch the workflow once to restart the
chain.

The hourly schedule stays enabled as a fallback, so even with the stop switch
in place the agent still runs once an hour.
