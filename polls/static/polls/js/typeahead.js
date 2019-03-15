var citynames = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
        url: 'get_tasks/',
        filter: function(list) {
            return $.map(list, function(cityname) {
                console.log({
                    name: cityname
                })
                return {
                    name: cityname
                };
            });
        }
    }
});
citynames.initialize();

$('input').tagsinput({
    typeaheadjs: {
        name: 'citynames',
        displayKey: 'name',
        valueKey: 'name',
        source: citynames.ttAdapter()
    }
});
