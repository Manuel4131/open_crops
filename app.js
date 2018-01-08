var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function get_opencrops() {
    crops = [];

    $.ajax({
        // url: "https://api.airtable.com/v0/appSHD6QX03beYde1/open_crop?sortField=family",
        url: "https://api.airtable.com/v0/appSHD6QX03beYde1/open_crop?sortField=id",
        headers: { 'Authorization': 'Bearer key5cOGuWwOqmI1DV' },
        type: 'get',
        async: false,
        success:function(data){
            crops = data['records'];
        },
        error:function(jqXHR, textStatus, errorThrown) {
            //alert(jqXHR.responseText);
            //alert(jqXHR.status);
            //alert(jqXHR.readyState);
            //alert(jqXHR.statusText);
            /*弹出其他两个参数的信息*/
            //alert(textStatus);
            //alert(errorThrown);
        }
    });

    return crops;
}

function get_opencrop(id) {
    $.ajax({
        url: "https://api.airtable.com/v0/appSHD6QX03beYde1/open_crop/" + id,
        headers: { 'Authorization': 'Bearer key5cOGuWwOqmI1DV' },
        type: 'get',
        success:function(crop){
            console.log(crop);

            data = [];
            data['id'] = crop['id'];
            data['common_names_zh'] = crop['fields']['common_names_zh'];
            data['common_names'] = crop['fields']['common_names'];
            data['binomial_name'] = crop['fields']['binomial_name']?crop['fields']['binomial_name']:crop['id'];
            data['cover'] = crop['fields']['cover'] ? crop['fields']['cover'] : '/No_Cover.jpg';
            data['family'] = (crop['fields']['family']?crop['fields']['family'] + ' ':'') + (crop['fields']['family_zh']?crop['fields']['family_zh']:'');
            data['genus'] = (crop['fields']['genus']?crop['fields']['genus'] + ' ':'') + (crop['fields']['genus_zh']?crop['fields']['genus_zh']:'');
            data['species'] = (crop['fields']['species']?crop['fields']['species'] + ' ':'') + (crop['fields']['species_zh']?crop['fields']['species_zh']:'');
            data['variety'] = (crop['fields']['variety']?crop['fields']['variety'] + ' ':'') + (crop['fields']['variety_zh']?crop['fields']['variety_zh']:'');
            data['origin'] = crop['fields']['origin'];

            render_detail(data);
            // dataSet = [];
            //
            // $.each(data['records'], function(idx, li) {
            //     // object to array
            //     //arr = Object.keys(li['fields']).map(function (key) { return li['fields'][key] ? li['fields'][key] : ''; });
            //
            //     dataSet.push([li['fields']['crop_name'], li['fields']['crop_variety'], li['fields']['address'], "<a target='_blank' href='" + li['fields']['image_url'] + "'>image</a>", "<a href='#' onclick='verify(\"" + li['id'] + "\")'>verify</a>", (li['fields']['open_crop_binding'] != "null") ? "" : "<a href='scientific.html?name=" + li['fields']['crop_name'] + "&id=" + li['id'] + "'>create</a>"]);
            // });
            //
            // // console.log(dataSet);
            //
            // $('#example').DataTable( {
            //     data: dataSet,
            //     paging: false
            // } );
        },
        error:function(jqXHR, textStatus, errorThrown) {
            //alert(jqXHR.responseText);
            //alert(jqXHR.status);
            //alert(jqXHR.readyState);
            //alert(jqXHR.statusText);
            /*弹出其他两个参数的信息*/
            //alert(textStatus);
            //alert(errorThrown);
        }
    });
}


function search_unique_opencrop(name) {
    data = null;

    $.ajax({
        url: 'https://api.airtable.com/v0/appSHD6QX03beYde1/open_crop?filterByFormula=(FIND("' + name + '",{common_names_zh}))',
        headers: { 'Authorization': 'Bearer key5cOGuWwOqmI1DV' },
        type: 'get',
        async: false,
        success:function(crop){
            if(crop['records'].length == 1){
                crop_list = crop['records'][0]['fields']['common_names_zh'].split(',');

                if(crop_list.indexOf(name) > -1){
                     data = crop['records'][0];
                }
            }
        },
        error:function(jqXHR, textStatus, errorThrown) {
        }
    });

    return data;
}

function binding_opencrop(upload_id, opencrop_id) {
    ret = false;

    $.ajax({
        url: 'https://api.airtable.com/v0/appSHD6QX03beYde1/open_crop_upload/' + upload_id,
        headers: { 'Authorization': 'Bearer key5cOGuWwOqmI1DV',
            'Content-Type' : 'application/json',
        },
        type: 'PATCH',
        data: JSON.stringify({ "fields": {"open_crop_binding": opencrop_id} }),
        async: false,
        success:function(data){
            // console.log('Success!');
            ret =  true;
        },
        error:function(jqXHR, textStatus, errorThrown) {
            // console.log('Error!');

            /*弹出jqXHR对象的信息*/
            //alert(jqXHR.responseText);
            //alert(jqXHR.status);
            //alert(jqXHR.readyState);
            //alert(jqXHR.statusText);
            /*弹出其他两个参数的信息*/
            //alert(textStatus);
            //alert(errorThrown);
        }
    });

    return ret;
}

function append_opencrop_common_name(id, name) {
    ret = false;

    // get crop
    crop = null;
    $.ajax({
        url: "https://api.airtable.com/v0/appSHD6QX03beYde1/open_crop/" + id,
        headers: { 'Authorization': 'Bearer key5cOGuWwOqmI1DV' },
        type: 'get',
        async: false,
        success:function(data){
            console.log(data);

            crop = data;
        },
        error:function(jqXHR, textStatus, errorThrown) {
            ret = false;
        }
    });

    if(crop) {
        names = crop['fields']['common_names_zh'];
        name_list = names.split(',');

        // if name not in common_names_zh
        if(names.indexOf(name) == -1) {
            names += ', ' + name;

            // update names
            $.ajax({
                url: 'https://api.airtable.com/v0/appSHD6QX03beYde1/open_crop/' + id,
                headers: { 'Authorization': 'Bearer key5cOGuWwOqmI1DV',
                    'Content-Type' : 'application/json',
                },
                type: 'PATCH',
                data: JSON.stringify({ "fields": {"common_names_zh": names} }),
                async: false,
                success:function(data){
                    ret = true;
                },
                error:function(jqXHR, textStatus, errorThrown) {
                    ret = false;
                }
            });
        } else {
            ret = true;
        }
    }

    return ret;
}

function render(mustache, data, id) {
    $.get(mustache, function(template) {
        var html = Mustache.to_html(template, data);
        $(id).html(html);
    });
}

function render_detail(data) {
    render('/detail.header.mustache', data, '#header');
    render('/detail.heading.mustache', data, '#heading');
    render('/detail.picture.mustache', data, '#picture');
    render('/detail.information.mustache', data, '#information');
}
