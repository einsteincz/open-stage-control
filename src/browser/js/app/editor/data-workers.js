var actions = require('../actions'),
    sidepanelCreateToggle = require('../sidepanel').createToggle,
    editObject = function(){editObject = require('./edit-objects').editObject; editObject(...arguments)},
    purgeStores = require('./purge'),
    {iconify} = require('../utils'),
    {widgetManager} = require('../managers'),
    parser = require('../parser'),
    parsewidgets = parser.widgets,
    parsetabs = parser.tabs

var getObjectData = function(obj){
    var path = []

    if (obj.hasClass('widget')) {
        return obj[0].abstract.props
    } else {
        return obj.closest('.widget')[0].abstract.props
    }

}

var updateDom = function(container,data, remote) {

    // save state
    var scroll = $('#sidepanel').scrollTop(),
        oldWidgets = container[0].abstract.hashes || [container[0].abstract.hash],
        wState = {},
        wScroll = {}

    for (let h of oldWidgets) {
        if (widgetManager.widgets[h]) {
            wState[widgetManager.widgets[h].getProp('id')] = widgetManager.widgets[h].getValue()
        }
    }

    // save scroll states
    for (let h of widgetManager.scrollingWidgets) {
        if (widgetManager.widgets[h] && widgetManager.widgets[h].scroll) {
            wScroll[widgetManager.widgets[h].getProp('id')] = widgetManager.widgets[h].scroll()
        }
    }

    // widget
    var newContainer = parsewidgets([data], container[0].abstract.parentNode, container[0].abstract.parent)
    container.replaceWith(newContainer)

    if (data.type == 'tab') newContainer.trigger('tab-created')

    if (container[0].abstract.parent && container[0].abstract.parent.registerHashes) {
        container[0].abstract.parent.registerHashes(true)
    }

    $('.editor-root').attr('data-widget', $('.root-container').attr('data-widget'))
    sidepanelCreateToggle()

    newContainer.trigger('resize')

    purgeStores(oldWidgets)


    // restore state
    for (let id in wState) {
        for (let w of widgetManager.getWidgetById(id)) {
            if (w.setValue) w.setValue(wState[id])
        }
    }

    // restore scroll states
    for (let id in wScroll) {
        for (let w of widgetManager.getWidgetById(id)) {
            if (w.scroll) w.scroll(wScroll[id])
        }
    }

    if (!remote) {
        editObject(newContainer,data,true)
    }

    $('#sidepanel').scrollTop(scroll)


    // return updated node
    return newContainer

}

var fakeStore = {}

var incrementWidget = function(data, root){

    if (!data) return

    if (root !== false) {
        fakeStore = {
            id:[],
            address:[]
        }
    }

    delete data.linkId

    var id = data.id,
        label = data.label,
        address = data.address

    if (id && id==label) {
        data.label = 'auto'
    }
    if (id && address == '/'+id) {

        data.address = 'auto'

    } else if (address){
        var addressref
        while (fakeStore.address.indexOf(address) != -1 || widgetManager.getWidgetByAddress(addressref).length) {
            address = address.replace(/([0-9]*)$/,function(m){
                var n = parseInt(m)+1
                n = isNaN(n)?1:n
                return n
            })
            addressref = widgetManager.createAddressRef(null, data.preArgs,address)
        }

        fakeStore.address.push(address)

        data.address = address

    }

    if (id) {
        while (fakeStore.id.indexOf(id) != -1 || widgetManager.getWidgetById(id).length) {
            id = id.replace(/([0-9]*)$/,function(m){
                var n = parseInt(m)+1
                n = isNaN(n)?1:n
                return n
            })
        }

        fakeStore.id.push(id)

        data.id = id

    }

    if (data.widgets && data.widgets.length) {
        for (let i in data.widgets) {
            data.widgets[i] = incrementWidget(data.widgets[i], false)
        }
    }

    if (data.tabs && data.tabs.length) {
        for (let i in data.tabs) {
            data.tabs[i] = incrementWidget(data.tabs[i], false)
        }
    }

    return data

}

module.exports = {
    updateDom:updateDom,
    getObjectData:getObjectData,
    incrementWidget:incrementWidget
}
