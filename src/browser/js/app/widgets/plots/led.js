var {mapToScale} = require('../utils'),
    _widgets_base = require('../common/_widgets_base'),
    {widgetManager} = require('../../managers')

module.exports = class Led extends _widgets_base {

    static defaults() {

        return {
            type:'led',
            id:'auto',

            _style:'style',

            label:'auto',
            left:'auto',
            top:'auto',
            width:'auto',
            height:'auto',
            pips:true,
            color:'auto',
            css:'',

            _plot:'plot',

            widgetId:'',

            _osc:'osc',

            range:{min:0,max:1},
            logScale:false,
            value:'',
            preArgs:[],
            address:'auto'

        }

    }

    constructor(options) {

        var html = `
            <div class="led">
            </div>
        `

        super({...options, html: html})

        if (this.getProp('widgetId').length) $('body').on(`change.${this.hash}`,this.syncHandle.bind(this))

        this.setValue(this.getProp('range').min)

    }

    onRemove() {

        $('body').off(`change.${this.hash}`)
        super.onRemove()

    }

    syncHandle(e) {

        if (this.getProp('widgetId')!=e.id || !widgetManager.getWidgetById(e.id).length) return
        var widget = widgetManager.getWidgetById(e.id),
            value
        for (var i=widget.length-1; i>=0; i--) {
            if (widget[i].getValue) {
                this.setValue(widget[i].getValue())
                return
            }
        }

    }
    setValue(v) {

        if (typeof v != 'number') return
        this.widget[0].style.setProperty('--opacity', mapToScale(v,[this.getProp('range').min,this.getProp('range').max],[0,1],false,this.getProp('logScale'),true))

    }

}
