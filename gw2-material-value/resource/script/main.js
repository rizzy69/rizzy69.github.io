(function ($) {
    var ui_assets = ['ui_coin_gold', 'ui_coin_silver', 'ui_coin_copper'];
    var ui_assets_loaded = [];
    var ajaxRecursiveDelay = 50;

    var resetSite = function () {
        setTableState(false);
        resetMaterialTable();
        setStatus('');
        setLoader(false);
    };
    var setStatus = function (message) {
        var $statusField = $('#status');
        $statusField.html(message);
    };
    var setLoader = function (state) {
        var $loader = $('#loader');
        if (state) {
            updateLoader(0);
            $loader.show();
        } else {
            updateLoader(0);
            $loader.hide();
        }
    };
    var updateLoader = function (percentage) {
        var $progressBar = $('#loader .progress-bar');
        $progressBar.css({ width: percentage + "%" });
    };
    var addMessage = function (message) {
        var $outputField = $('#output');
        $('<p>' + message + '</p>').appendTo($outputField);
    };
    var addMaterialToTable = function (material) {
        /**
                <td><!-- Icon --></td>
                <td>Name</td>
                <td>Inventory</td>
                <td>Value per Item (min)</td>
                <td>Value per Item (max)</td>
                <td>Value total (min)*</td>
                <td>Value total (max)*</td>
         */
        var $tableBody = $('#materials-table tbody');
        var unitBuy = material.price.buys.unit_price;
        var unitSell = material.price.sells.unit_price;
        var totalBuy = material.count * unitBuy;
        var totalSell = material.count * unitSell;
        $('<tr/>')
            .append('<td><img src="' + material.itemInfo.icon + '"/></td>')
            .append('<td data-value="'+material.itemInfo.name+'">' + material.itemInfo.name + '</td>')
            .append('<td data-value="'+material.count+'">' + material.count + '</td>')
            .append('<td data-value="'+unitBuy+'">' + formatPrice(unitBuy) + '</td>')
            .append('<td data-value="'+unitSell+'">' + formatPrice(unitSell) + '</td>')
            .append('<td data-value="'+totalBuy+'">' + formatPrice(totalBuy) + '</td>')
            .append('<td data-value="'+totalSell+'">' + formatPrice(totalSell) + '</td>')
            .data('unitBuy', unitBuy)
            .data('unitSell', unitSell)
            .data('totalBuy', totalBuy)
            .data('totalSell', totalSell)
            .appendTo($tableBody);
        updateMaterialTable();
    };
    var setTableState = function (state) {
        var $table = $('#materials-table');
        if (state) {
            $table.show();
        } else {
            $table.hide();
        }
    };

    var updateMaterialTable = function () {
        var $sum = $('#sum');
        var $tableBody = $('#materials-table tbody');
        var $sumTotalMin = $('#sum-total-min');
        var $sumTotalMax = $('#sum-total-max');
        var sumTotalMin = 0;
        var sumTotalMax = 0;
        $tableBody.find('tr').each(function () {
            sumTotalMin += $(this).data('totalBuy');
            sumTotalMax += $(this).data('totalSell');
        });
        $sumTotalMin.html(formatPrice(sumTotalMin));
        $sumTotalMax.html(formatPrice(sumTotalMax));
        if (sumTotalMax !== 0 || sumTotalMin !== 0) {
            $sum.show();
        } else {
            $sum.hide();
        }
    };

    var resetMaterialTable = function () {
        var $tableBody = $('#materials-table tbody');
        var $sumTotalMin = $('#sum-total-min');
        var $sumTotalMax = $('#sum-total-max');
        $tableBody.html('');
        $sumTotalMin.html('');
        $sumTotalMax.html('');
    };

    // api URLs
    var API_BASE_URL = "https://api.guildwars2.com/v2";
    var API_BASE_URL_ITEMS = API_BASE_URL + "/items";
    var API_BASE_URL_ACCOUNT = API_BASE_URL + "/account";
    var API_BASE_URL_ACCOUNT_MATERIALS = API_BASE_URL_ACCOUNT + "/materials";
    var API_BASE_URL_COMMERCE = API_BASE_URL + "/commerce";
    var API_BASE_URL_COMMERCE_PRICES = API_BASE_URL_COMMERCE + "/prices";
    var API_BASE_URL_FILES = API_BASE_URL + "/files";

    // no private methods

    // public methods
    var formatPrice = function (initialSum) {
        var sumRemaining = initialSum;
        var gold = Math.floor((sumRemaining / 10000));
        sumRemaining = sumRemaining - (gold * 10000);
        var silver = Math.floor((sumRemaining / 100));
        sumRemaining = sumRemaining - (silver * 100);

        var goldString = "<img data-asset='ui_coin_gold' alt='Gold' />";
        var silverString = "<img data-asset='ui_coin_silver' alt='Silver' />";
        var copperString = "<img data-asset='ui_coin_copper' alt='Copper' />";
        if (ui_assets_loaded['ui_coin_gold']) {
            goldString = "<img src='" + ui_assets_loaded['ui_coin_gold'] + "' alt='Gold' />";
        }
        if (ui_assets_loaded['ui_coin_silver']) {
            silverString = "<img src='" + ui_assets_loaded['ui_coin_silver'] + "' alt='Silver' />";
        }
        if (ui_assets_loaded['ui_coin_copper']) {
            copperString = "<img src='" + ui_assets_loaded['ui_coin_copper'] + "' alt='Copper' />";
        }
        var result = gold + goldString + silver + silverString + sumRemaining + copperString;
        return result;
    };

    var getItems = function (callback) {
        // loads all existing items
        jQuery.ajax({
            url: API_BASE_URL_ITEMS,
        }).done(function (data) {
            callback(data);
        }).fail(function (jqXHR, textStatus) {
            console.error("Request failed: " + textStatus);
        });
    };

    var getItemInfo = function (itemId, callback) {
        // gets additional information on an item
        jQuery.ajax({
            url: API_BASE_URL_ITEMS + "/" + itemId,
        }).done(function (data) {
            callback(data);
        }).fail(function (jqXHR, textStatus) {
            console.error("Request failed: " + textStatus);
        });
    };

    var getAccountMaterials = function (apiKey, callback) {
        // initially loads a list of the materials on the account
        jQuery.ajax({
            url: API_BASE_URL_ACCOUNT_MATERIALS + "?access_token=" + apiKey,
        }).done(function (data) {
            callback(data);
        }).fail(function (jqXHR, textStatus) {
            console.error("Request failed: " + textStatus);
        });
    };

    var getCommercePriceForMaterial = function (itemId, callback) {
        // gets the current price for a certain material
        jQuery.ajax({
            url: API_BASE_URL_COMMERCE_PRICES + "/" + itemId,
        }).done(function (data) {
            callback(data);
        }).fail(function (jqXHR, textStatus) {
            console.error("Request failed: " + textStatus);
        });
    };

    var getItemInfoRecursive = function (items, results, next) {
        updateLoader(100 * results.length / (items.length + results.length));
        if (!items.length) {
            next(results);
        } else {
            var currentItem = items.shift();
            setTimeout(function () {
                getItemInfo(currentItem.id, function (data) {
                    currentItem.itemInfo = data;
                    results.push(currentItem);
                    getItemInfoRecursive(items, results, next);
                });
            }, ajaxRecursiveDelay);
        }
    };

    var getPriceRecursive = function (items, results, next) {
        updateLoader(100 * results.length / (items.length + results.length));
        if (!items.length) {
            next(results);
        } else {
            var currentItem = items.shift();
            setTimeout(function () {
                getCommercePriceForMaterial(currentItem.id, function (data) {
                    currentItem.price = data;
                    results.push(currentItem);
                    addMaterialToTable(currentItem);
                    getPriceRecursive(items, results, next);
                });
            }, ajaxRecursiveDelay);
        }
    };

    var getAssetsRecursive = function (assets, results, next) {
        // gets the asset
        if (!assets.length) {
            next(results);
        } else {
            var assetId = assets.shift();
            jQuery.ajax({
                url: API_BASE_URL_FILES + "/" + assetId,
            }).done(function (data) {
                results[assetId] = data.icon;
                setTimeout(function () {
                    getAssetsRecursive(assets, results, next);
                }, ajaxRecursiveDelay);
            }).fail(function (jqXHR, textStatus) {
                console.error("Request failed: " + textStatus);
            });
        }
    };

    var loadAssets = function () {
        getAssetsRecursive(ui_assets, ui_assets_loaded, function (results) {
            // replace placeholders with real source url, if they exist
            $('img').each(function () {
                var $this = $(this);
                if (typeof $this.data('asset') === 'string' && $this.data('asset') !== '') {
                    $this.attr('src', results[$this.data('asset')]);
                    $this.data('asset', '');
                }
            });
        });
    };

    $(window).on('load', function () {
        loadAssets();
        $('#get-form').submit(function (e) {
            e.preventDefault();
            resetSite();
            var $form = $('#get-form');
            var apiKey = $form.find('[name="api-key"]').val();
            if (apiKey.length) {
                var buySum = 0; // sum of Highest Buy Orders
                var sellSum = 0; // sum of Lowest Sell Orders
                var counter = 0;
                setStatus("Loading account materials...");
                getAccountMaterials(apiKey, function (materials) {
                    /*
                    *   Example material:
                    *        binding:"Account" // account bound material
                    *        category:46
                    *        count:500 // count in account inventory
                    *        id:46731 // internal material id
                    */
                    setStatus("Found " + materials.length + " materials. Loading data ...");
                    materials = materials.filter(function(material) {
                        if (typeof material.binding !== 'undefined' && material.binding === 'Account') {
                            return false;
                        }
                        if (typeof material.count !== 'undefined' && material.count === 0) {
                            return false;
                        }
                        return true;
                    });
                    setStatus("Found " + materials.length + " relevant materials. Loading additional item information (this may take a while) ...");
                    setLoader(true);
                    getItemInfoRecursive(materials, [], function (results) {
                        setLoader(false);
                        // addMessage("Loaded additional item information, filtering for sellable items ...");
                        materials = results.filter(function(material) {
                            for (var i = 0; i < material.itemInfo.flags.length; i++) {
                                if (material.itemInfo.flags[i] === 'AccountBound'
                                    || material.itemInfo.flags[i] === 'NoSell') {
                                    return false;
                                }
                            }
                            return true;
                        });
                        setStatus("Loading price information for " + materials.length + " sellable items (this may take a while, as well) ...");
                        setLoader(true);
                        getPriceRecursive(materials, [], function (results) {
                            // Done loading everything
                            setLoader(false);
                            setStatus('');
                            setTableState(true);
                            // console.log(results);
                        });
                    });
                });
            } else {
                setStatus('Please enter your API Key');
            }
        });

        $('th[data-sort-column]').on('click touchstart', function(e) {
            e.stopImmediatePropagation();
            var $this = $(this);
            var columnId = $this.data('sortColumn');

            // get all rows
            var $tableBody = $this.closest('table').find('tbody');
            var $tableRows = $tableBody.find('tr');
            var sortArray = [];
            $tableRows.each(function() {
                var $this = $(this);
                sortArray.push($this);
            })
            sortArray = sortArray.sort(function($a, $b) {
                var aVal = $a.find('td:nth-of-type('+columnId+')').data('value');
                var bVal = $b.find('td:nth-of-type('+columnId+')').data('value');
                if(aVal < bVal) {
                    return 1;
                } else if(bVal < aVal) {
                    return -1;
                } else {
                    return 0;
                }
            });
            $tableBody.html('');
            for(var i = 0; i < sortArray.length; i++) {
                $tableBody.append(sortArray[i]);
            }
        });
    });
})(jQuery);