var PAVmodel = function(model, d){
    this.model = model;
    this.states = {
        live: 'virtual',// ('virtual', 'alive', 'deceased')
        anchor: true,
        expand: true,   // if is anchor, expand upper gen+ sibling-grp
        focus: false,
        visible: true
    };
    this.state = function(v){
        if (typeof v === 'string'){
            // it is a state-query giving the state-key
            return this.states[v];
        } else if (typeof v === 'object') {
            // setting states with dictionary
            for(var k in v){
                this.states[k] = v[k];
            }
        }
        return this;
    };
}