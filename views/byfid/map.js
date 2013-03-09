function(doc) {
    if(doc.fid){
        emit(doc.fid, doc);
    }
}
