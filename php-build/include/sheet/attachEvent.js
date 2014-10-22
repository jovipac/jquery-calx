sheet.fx.attachEvent = function(){
    //console.log('sheet[#'+this.elementId+'] : attaching events to the element');

    var currentSheet = this;

    /**
     * get the unformatted value of the cell, and display it to the element
     */
    this.el.on('calx.getValue', 'input[data-cell]', function(){
        var cellAddr    = $(this).attr('data-cell'),
            currentCell = currentSheet.cells[cellAddr],
            cellValue   = currentCell.getValue(),
            cellFormat  = currentCell.getFormat();

        if(cellFormat && cellFormat.indexOf('%') > -1){
            cellValue = cellValue*100+' %';
        }

        currentCell.el.val(cellValue);
        //console.log(currentCell.getValue());
    });

    /**
     * get the formatted value of the cell, and display it to the element
     */
    this.el.on('calx.renderComputedValue', 'input[data-cell]', function(){
        var cellAddr    = $(this).attr('data-cell'),
            currentCell = currentSheet.cells[cellAddr];

        currentCell.renderComputedValue();
    });

    /**
     * update value of the current cell internally
     */
    this.el.on('calx.setValue', 'input[data-cell], select', function(){
        var cellAddr    = $(this).attr('data-cell'),
            currentCell = currentSheet.cells[cellAddr];

        currentCell.setValue($(this).val());

    });

    /**
     * calculate the whole sheet
     */
    this.el.on('calx.calculateSheet', 'input[data-cell]', function(){
        currentSheet.calculate();
    });

    /**
     * update current cell value, and recalculate it's dependant
     */
    this.el.on('calx.calculateCellDependant', 'input[data-cell], select', function(){
        var cellAddr    = $(this).attr('data-cell'),
            currentCell = currentSheet.cells[cellAddr];

        if(true === calx.isCalculating){
            calx.isCalculating = false;
        }
        currentSheet.clearProcessedFlag();
        currentCell.calculate(true, false);

        if(currentSheet.hasRelatedSheet()){
            currentSheet.calculate();
        }else{
            currentSheet.renderComputedValue();
        }

    });

    /**
     * bind to internal event, so no need to unbind the real event on destroy
     */
    this.el.on(currentSheet.config.autoCalculateTrigger, 'input[data-cell]',function(){
        //console.log('blurred');
        var $this = $(this);
        if(!$this.attr('data-formula')){
            if(currentSheet.config.autoCalculate){
                //console.log('calculating dependant');
                setTimeout(function(){
                    $this.trigger('calx.calculateCellDependant');
                }, 50);
            }
        }
    });

    this.el.on('blur', 'input[data-cell]', function(){
        //console.log($(this).attr('data-cell')+'blur');
        $(this).trigger('calx.renderComputedValue');
    });

    /**
     * change behaviour, based on configuration
     * autoCalculate : on   => calx.calculateCellDependant
     * autoCalculate : off  => calx.setValue
     */
    this.el.on('change', 'select', function(){
        $(this).trigger('calx.setValue');

        if(currentSheet.config.autoCalculate){
            $(this).trigger('calx.calculateCellDependant');
        }
    });

    /** focus does not depend on configuration, always get the value on focus */
    this.el.on('focus', 'input[data-cell]',function(){
        //console.log($(this).attr('data-cell')+'focus');
        $(this).trigger('calx.getValue');
    });

    /** keyup does not depend on configuration, always set value on keyup */
    this.el.on('keyup', 'input[data-cell]',function(e){
        //console.log($(this).attr('data-cell')+'key up');
        if($(this).attr('data-formula')){
            e.preventDefault();
            return false;
        }else{
            $(this).trigger('calx.setValue');
        }
    });
};

sheet.fx.detachEvent = function(){
    //console.log('sheet[#'+this.elementId+'] : detaching events from the element');

    this.el.off('calx.getValue');
    this.el.off('calx.setValue');
    this.el.off('calx.renderComputedValue');
    this.el.off('calx.calculateSheet');
    this.el.off('calx.calculateCellDependant');
}