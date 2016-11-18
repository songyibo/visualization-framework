var vis = vis || {};

vis.html = (function(vis) {
    
    function Dropdown(widgetID, selectedCallback) {
        this.wid = widgetID;
        var container = $('#' + this.wid);
        if (!container[0]) return;

        var btnGroup = $('<div>').addClass('btn-group').appendTo(container);
        var button = $('<button>').addClass('btn btn-default btn-sm dropdown-toggle')
            .attr('type', 'button').attr('data-toggle', 'dropdown')
            .html('<span>Select Dataset</span>&nbsp;&nbsp;<span class="caret"></span>').appendTo(btnGroup);
        var dropdownMenu = $('<ul>').addClass('dropdown-menu').appendTo(btnGroup);

        dropdownMenu.on('click', 'li a', function() {
            var text = $(this).text();
            button.find('span:first').text(text);
            if (selectedCallback) {
                selectedCallback(text);
            }
        });

        this.menu = dropdownMenu;
        this.selected = button.find('span:first');
    }

    Dropdown.prototype.addMenuItem = function(text) {
        var a = $('<a>').text(text);
        var li = $('<li>').append(a);
        this.menu.append(li);
    };

    Dropdown.prototype.getValue = function() {
        return this.selected.text();
    };

    return {
        Dropdown: Dropdown
    };
})(vis);
