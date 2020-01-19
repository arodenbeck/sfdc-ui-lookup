({
    updateSearchTerm : function(component, searchTerm) {
        // Save search term so that it updates input
        component.set('v.searchTerm', searchTerm);
        
        // Get previous clean search term
        const cleanSearchTerm = component.set('v.cleanSearchTerm');

        // Compare clean new search term with current one and abort if identical
        const newCleanSearchTerm = searchTerm.trim().replace(/\*/g, '').toLowerCase();
        if (cleanSearchTerm === newCleanSearchTerm) {
            return;
        }

        // Update clean search term for later comparison
        component.set('v.cleanSearchTerm', newCleanSearchTerm);

        // Ignore search terms that are too small
        if (newCleanSearchTerm.length < 2) {
            component.set('v.searchResults', []);
            return;
        }

        // Apply search throttling (prevents search if user is still typing)
        let searchTimeout = component.get('v.searchThrottlingTimeout');
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        searchTimeout = window.setTimeout(
            $A.getCallback(function() {
                // Send search event if it long enougth
                const searchTerm = component.get('v.searchTerm');
                if (searchTerm.length >= 2) {
                    const searchEvent = component.getEvent('onSearch');
                    searchEvent.fire();
                }
                component.set('v.searchThrottlingTimeout', null);
            }),
            300
        );
        component.set('v.searchThrottlingTimeout', searchTimeout);
    },

    selectResult : function(component, recordId) {
        // Save selection
        const searchResults = component.get('v.searchResults');
        const selectedResult = searchResults.filter(function(result) { return result.id === recordId; });
        if (selectedResult.length > 0) {
            const selection = component.get('v.selection');
            selection.push(selectedResult[0]);
            component.set('v.selection', selection);
        }
        // Reset search
        component.set('v.searchTerm', '');
        component.set('v.searchResults', []);
    },

    getSelectedIds : function(component) {
        const selection = component.get('v.selection');
        return selection.map(function(element) { return element.id; });
    },

    removeSelectedItem : function(component, removedItemId) {
        const selection = component.get('v.selection');
        const updatedSelection = selection.filter(function(item) { return item.id !== removedItemId; });
        component.set('v.selection', updatedSelection);
    },

    clearSelection : function(component, itemId) {
        component.set('v.selection', []);
        // Fire event so that it fires the validation
        var event = component.getEvent('onSelection');
        if (event) {
            event.fire();
        }
    },

    isSelectionAllowed : function(component) {
        return component.get('v.isMultiEntry') || component.get('v.selection').length === 0;
    },

    downArrow : function(component) {
        var ariaIndex = component.get('v.ariaIndex');
        const searchResults = component.get('v.searchResults');
        if(searchResults.length !== 0 && ariaIndex < searchResults.length) {
            ariaIndex++;
            component.set('v.ariaIndex', ariaIndex);
            this.setAriaActiveDescendant(component);
        }  // End the ariaIndex is less than the number of selections
    },

    upArrow : function(component) {
        var ariaIndex = component.get('v.ariaIndex');
        const searchResults = component.get('v.searchResults');
        if(searchResults.length !== 0 && ariaIndex > 0) {
            ariaIndex--;
            component.set('v.ariaIndex', ariaIndex);
            this.setAriaActiveDescendant(component);
        }  // End if ariaIndex is greater than 0 
    },

    setAriaActiveDescendant : function(component) {
        const searchResults = component.get('v.searchResults');
        const ariaIndex = component.get('variaIndex');
        var activeId = searchResults[ariaIndex].Id;
        component.set('v.ariaActiveDescendant', activeId);
    },

    toggleSearchSpinner : function(component) {
        const spinner = component.find('spinner');
        const searchIcon = component.find('search-icon');

        $A.util.toggleClass(spinner, 'slds-hide');
        $A.util.toggleClass(searchIcon, 'slds-hide');
    }
})
