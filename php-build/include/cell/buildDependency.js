/**
 * build inter-cell dependency and dependant list, used for triggerring calculation that related to other cell
 * @return {void}
 */
cell.prototype.buildDependency = function(){
    var pattern = {
            cellRange       : /[A-Za-z]+[0-9]+\s*:\s*[A-Za-z]+[0-9]+/g,
            cell            : /[A-Z]+[0-9]+/g
        },
        formula     = this.formula,
        cellAddress = this.address,
        dependencies,
        a, i, j, key,
        formulaPart,
        cellStart,
        cellStop,
        cellPart,
        cellObject,
        cellMatch;


    /** clear up the dependant and dependency reference */
    for(a in this.dependencies){
        /** if not remote cell */
        this.dependencies[a].removeDependant(cellAddress);
        delete this.dependencies[a];
    }

    if(formula){
        /**
         * searching for cells in formula
         */
        for(a in pattern){
            cellMatch   = formula.match(pattern[a]);
            formula     = formula.replace(pattern[a], '');

            if(null !== cellMatch){
                switch(a){

                    case "cellRange":
                        for(i = 0; i < cellMatch.length; i++){
                            cellPart    = cellMatch[i].split(':');
                            cellStart   = $.trim(cellPart[0]);
                            cellStop    = $.trim(cellPart[1]);

                            dependencies = this.sheet.getCellRange(cellStart, cellStop);
                            for(j in dependencies){
                                if(typeof(this.dependencies[j]) == 'undefined' && false !== dependencies[j]){
                                    this.dependencies[j] = dependencies[j];
                                    dependencies[j].registerDependant(this.getAddress(), this);

                                }
                            }
                        }
                        break;

                    case "cell":
                        for(i = 0; i < cellMatch.length; i++){
                            cellPart    = cellMatch[i];

                            dependencies = this.sheet.getCell(cellPart);
                            if(typeof(this.dependencies[cellPart]) == 'undefined' && false !== dependencies){
                                this.dependencies[cellPart] = dependencies;
                                dependencies.registerDependant(this.getAddress(), this);

                            }
                        }
                        break;
                }
            }
        }
    }

    var dlist = [];
    for(a in this.dependencies){
        dlist.push(a);
    }
    //console.log('cell[#'+this.sheet.elementId+'!'+this.address+'] :  Building dependency list '+dlist);
};