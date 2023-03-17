export class FabulaUltimaItemSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fabulaultima", "sheet", "item"],
            width: 560,
            height: 500,
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "attributes",
                },
            ],
        });
    }

    get template() {
        const path = "systems/fabulaultima/templates/item";

        // unique sheet for each type of item
        return `${path}/item-${this.item.type}-sheet.hbs`;
    }

    async getData() {
        const data = super.getData();

        // Get ActiveEffects
        data.effects = data.item.getEmbeddedCollection("ActiveEffect").contents;

        // Enriched Text from editors
        data.enrichedQuality = await TextEditor.enrichHTML(this.object.system.quality, {
            async: true,
        });
        data.enrichedNotes = await TextEditor.enrichHTML(this.object.system.notes, { async: true });
        if (this.object.system.hasOwnProperty("opportunity")) {
            data.enrichedOpportunity = await TextEditor.enrichHTML(
                this.object.system.opportunity.quality,
                { async: true }
            );
        }

        console.log(data);
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        if (!this.options.editable) return;
        // html.find(".effect-control").click(this._onEffectControl.bind(this));
    }

    // _onEffectControl(event) {
    //     event.preventDefault();
    //     const owner = this.item;
    //     const a = event.currentTarget;
    //     const li = a.closest("li");
    //     const effect = li?.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;

    //     switch (a.dataset.action) {
    //         case "create":
    //             if (this.item.isEmbedded) {
    //                 return ui.notifications.error(
    //                     "Managing embedded Documents which are not direct descendants of a primary Document is un-supported at this time."
    //                 );
    //             }
    //             return owner.createEmbeddedDocuments("ActiveEffect", [
    //                 {
    //                     label: "New Effect",
    //                     icon: "icons/svg/aura.svg",
    //                     origin: owner.uuid,
    //                     disabled: true,
    //                 },
    //             ]);
    //         case "edit":
    //             return effect.sheet.render(true);
    //         case "delete":
    //             return effect.delete();
    //     }
    // }
}
