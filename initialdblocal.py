# -----------------------------------------------------------------------------
# makeinitialdb.py
# run this python script to create the initial DB on couchdb
# last update 2013-01-02 1301 2nd st. Palacios
# -----------------------------------------------------------------
from initialdb import dbmain
from initialdb import dbname

if __name__ == '__main__':
    dbmain('localhost','5984', dbname)
