# -----------------------------------------------------------------------------
# pushdb.py     2013-03-24 Jianchi Wei
# purpose: push all docs in docs.buf to db
# --------
# 2013-04-06: added get_cmdline_params to read cmd-line parameters, that
#             can specify db-name and server url, overriding defaults.
# -----------------------------------------------------------------------------
import couchdb
import sys, os, os.path, codecs
DEF_URL = 'http://localhost:5984'
DEF_DBNAME = 'hftdb'
rootdir = '.data/'
# -----------------------------------------------------------------------------
# there was problem with unicode when db.save(doc). That was when non-ascii 
# char in the string (e.g. Chinese chars). The pushdb.py would generate err
# 1. if put a u before the string: u'<string>', and save the docs.buf file
#    with utf-8 with BOM encoding, then it works. Another way it works:
# 2. save with encoding utf-8 without BOM, but I have to conver every string
#    with '<string>'.decode('utf-8') into unicode string. In this case, I may
#    not have to put u in front of "<string>".
# but 1 works, so I will let it be with solution 1, and make sure that in 
# docs.buf, I put u'<string>' for all strings that may contains non-ASCII chars
# -----------------------------------------------------------------------------
def getdb(url, dbn):
    server = couchdb.Server(url)
    db = ''
    if dbn in server:
        return server[dbn]
    else:
        return server.create(dbn)

# delete all db entries whose _id's first 7 chars match fid
# _design/* will not be deleted, since no fid=='_design'
def cleanup(fid, db):
    mapfun = "function(doc){ emit(doc.id, doc); }"
    rows = db.query(mapfun)
    for row in rows:
        if row.id[0:7] == fid:
            db.delete(row.value)
            print 'deleted:',row.id
        
def pushfid(fid, db):
    filepath = rootdir + fid + '/docs.buf'
    attapath = rootdir + fid + '/attachments/'
    docs_data = codecs.open(filepath,'rb','utf-8').read()
    lst = eval(docs_data)               # list of docs from data file
    for doc in lst:
        db.save(doc)
        print '-'*80
        print 'pushing ',doc['_id']
        if doc['_id'].startswith(fid+'-RS'):
            fn = doc['name']
            f = open(attapath + fn,'rb')# open attchment binary file
            db.put_attachment(doc,
                              f,            # file object
                              fn,           # file name
                              doc['mime'])  # e.g. image/jpg
            print fn,' attached under ',doc['_id']
        print '-'*80
    db.commit()

def main(url, dbn):
    db = getdb(url, dbn)
    #fids = [fn[6:] for fn in glob(".data/*") if not fn.endswith(".bak")]
    #for fid in fids:
    #    pushfid(fid, db, 'pushdb.log')
    cleanup("3TXE45N", db)
    pushfid("3TXE45N", db)

def get_cmdline_params():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', 
                        '--database-name', 
                        help='database name(def.: %s)'%(DEF_DBNAME), 
                        default=DEF_DBNAME)
    parser.add_argument('-t', 
                        '--target-server-url', 
                        help='target db server url(def.: %s)'%(DEF_URL),
                        default=DEF_URL)
    args = parser.parse_args()
    #print 'database name:',args.database_name
    #print 'target server url:',args.target_name
    return args.database_name, args.target_server_url

if __name__ == "__main__":
    dbname, url = get_cmdline_params()
    main(url, dbname)