$(document).ready(function() {
    var toolbox = $('#toolbox');
    var tx = toolbox.width(), ty = toolbox.height();

    $('#main-content').on('mousemove', function(e) {
        var x = e.pageX - $(this).offset().left;
        var y = e.pageY - $(this).offset().top;
        if (x < tx && y <= ty) {
            toolbox.addClass('toolbox-show');
        }
    });

    toolbox.on('mouseleave', function(e) {
        $(this).removeClass('toolbox-show');
    });

    $('.module-box').on('click', function() {
        var m = $(this).attr('data-module');
        var w = $(document).width(), h = $(document).height();
        vis.control.instance().createModule(m, w / 3, h / 3);
    });

    $('.module-box[draggable]').on('dragstart', function(e) {
        var element = $(this).attr('data-element');
        e.originalEvent.dataTransfer.setData('vis-ui-drop', element);
    });

    $('.module-box[draggable]').on('drag', function(e) {
        e.preventDefault();
    });
});
