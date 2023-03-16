import { fabulaAttackRoll, fabulaSkillRoll } from "../roll/roll.js";

export class FabulaUltimaActorSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fabulaultima", "sheet", "actor"],
            template: "systems/fabulaultima/templates/actor/actor-sheet.hbs",
            width: 700,
            height: 800,
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "attributes",
                },
            ],
        });
    }

    async getData() {
        const data = super.getData();

        data.effects = data.actor.getEmbeddedCollection("ActiveEffect").contents;

        if (this.actor.type === "player") {
            this._prepareCharacterItems(data);
        }

        return data;
    }

    _prepareCharacterItems(sheetData) {
        const actorData = sheetData.actor;
        const accessories = [];
        const armor = [];
        const bonds = [];
        const classes = [];
        const consumables = [];
        const skills = [];
        const spells = [];
        const weapons = [];

        sheetData.items.forEach((item) => {
            switch (item.type) {
                case "accessory":
                    accessories.push(item);
                    break;

                case "armor": {
                    armor.push(item);
                    break;
                }

                case "bond": {
                    bonds.push(item);
                    break;
                }

                case "class": {
                    classes.push(item);
                    break;
                }

                case "consumable": {
                    consumables.push(item);
                    break;
                }

                case "skill": {
                    skills.push(item);
                    break;
                }

                case "spell": {
                    spells.push(item);
                    break;
                }

                case "weapon": {
                    weapons.push(item);
                    break;
                }

                default: {
                    console.log("itemType ", item.type, " is not currently implemented.");
                }
            }
        });

        // This gets put into the actor object. For consistency, my data is stored in actor.system
        actorData.system.accessories = accessories;
        actorData.system.armor = armor;
        actorData.system.bonds = bonds;
        actorData.system.classes = classes;
        actorData.system.consumables = consumables;
        actorData.system.skills = skills;
        actorData.system.spells = spells;
        actorData.system.weapons = weapons;
    }

    activateListeners(html) {
        super.activateListeners(html);

        if (!this.options.editable) return;

        // Edit items
        html.find(".item-edit").click((ev) => {
            const parent = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(parent.data("itemId"));

            item.sheet.render(true);
        });

        // Make a roll based on an item's stats
        html.find(".item-roll").click((ev) => {
            ev.preventDefault();

            const parent = $(ev.currentTarget).parents(".item");
            const attackType = ev.currentTarget.dataset.attackType;
            const item = this.actor.items.get(parent.data("itemId"));
            const main = this.actor.system.attributes[item.system.accuracy.mainStat];
            const sec = this.actor.system.attributes[item.system.accuracy.secondaryStat];

            switch (attackType) {
                case "weapon":
                    fabulaAttackRoll(this.actor, main, sec, item, "weapon");
                    break;
                case "spell":
                    fabulaAttackRoll(this.actor, main, sec, item, "spell");
                    break;
            }
        });

        // Delete an item
        html.find(".item-delete").click((ev) => {
            const parent = $(ev.currentTarget).parents(".item");
            let options = {};
            const dialog = Dialog.confirm({
                title: game.i18n.localize("FU.UI.areYouSure"),
                yes: () =>
                    this.actor.deleteEmbeddedDocuments("Item", [parent.data("itemId")], options),
                no: () => close,
                defaultYes: false,
            });
        });

        // Create an item
        html.find(".item-create").click(this._onItemCreate.bind(this));

        // Update the equipped status for an item
        html.find(".equipped").click(this._onItemEquippedStatusChange.bind(this));

        // Open compendium
        html.find(".open-compendium").click((ev) => {
            ev.preventDefault();

            let dataset = ev.currentTarget.dataset;
            let dialog;

            switch (dataset.compendium) {
                case "accessory": {
                    game.packs
                        .find((k) => k.collection === "fabulaultima.accessories")
                        .render(true);
                    break;
                }
                case "armor":
                    game.packs.find((k) => k.collection === "fabulaultima.armor").render(true);
                    break;
                case "classes":
                    game.packs
                        .find((k) => k.collection === "fabulaultima.character-classes")
                        .render(true);
                    break;
                case "consumables":
                    game.packs
                        .find((k) => k.collection === "fabulaultima.consumables")
                        .render(true);
                    break;
                case "skill": {
                    game.packs.find((k) => k.collection === "fabulaultima.skills").render(true);
                    break;
                }
                case "spell": {
                    game.packs.find((k) => k.collection === "fabulaultima.spells").render(true);
                    break;
                }
                case "weapons":
                    dialog = new Dialog({
                        title: game.i18n.localize("FU.UI.selectCompendium"),
                        buttons: {
                            arcane: {
                                label: game.i18n.localize("FU.Weapons.Categories.arcane"),
                                callback: () =>
                                    game.packs
                                        .find((k) => k.collection === "fabulaultima.weapons-arcane")
                                        .render(true),
                            },
                            bows: {
                                label: game.i18n.localize("FU.Weapons.Categories.bow"),
                                callback: () =>
                                    game.packs
                                        .find((k) => k.collection === "fabulaultima.weapons-bows")
                                        .render(true),
                            },
                            brawling: {
                                label: game.i18n.localize("FU.Weapons.Categories.brawling"),
                                callback: () =>
                                    game.packs
                                        .find(
                                            (k) => k.collection === "fabulaultima.weapons-brawling"
                                        )
                                        .render(true),
                            },
                            daggers: {
                                label: game.i18n.localize("FU.Weapons.Categories.dagger"),
                                callback: () =>
                                    game.packs
                                        .find(
                                            (k) => k.collection === "fabulaultima.weapons-daggers"
                                        )
                                        .render(true),
                            },
                            firearms: {
                                label: game.i18n.localize("FU.Weapons.Categories.firearm"),
                                callback: () =>
                                    game.packs
                                        .find(
                                            (k) => k.collection === "fabulaultima.weapons-firearms"
                                        )
                                        .render(true),
                            },
                            flails: {
                                label: game.i18n.localize("FU.Weapons.Categories.flail"),
                                callback: () =>
                                    game.packs
                                        .find((k) => k.collection === "fabulaultima.weapons-flails")
                                        .render(true),
                            },
                            heavy: {
                                label: game.i18n.localize("FU.Weapons.Categories.heavy"),
                                callback: () =>
                                    game.packs
                                        .find((k) => k.collection === "fabulaultima.weapons-heavy")
                                        .render(true),
                            },
                            shields: {
                                label: game.i18n.localize("FU.Weapons.Categories.shield"),
                                callback: () =>
                                    game.packs
                                        .find(
                                            (k) => k.collection === "fabulaultima.weapons-shields"
                                        )
                                        .render(true),
                            },
                            spears: {
                                label: game.i18n.localize("FU.Weapons.Categories.spear"),
                                callback: () =>
                                    game.packs
                                        .find((k) => k.collection === "fabulaultima.weapons-spears")
                                        .render(true),
                            },
                            swords: {
                                label: game.i18n.localize("FU.Weapons.Categories.sword"),
                                callback: () =>
                                    game.packs
                                        .find((k) => k.collection === "fabulaultima.weapons-swords")
                                        .render(true),
                            },
                            thrown: {
                                label: game.i18n.localize("FU.Weapons.Categories.thrown"),
                                callback: () =>
                                    game.packs
                                        .find((k) => k.collection === "fabulaultima.weapons-thrown")
                                        .render(true),
                            },
                        },
                    });
                    dialog.render(true);
                    break;
                default:
                    console.log(
                        "Compendium ",
                        dataset.compendium,
                        " is not currently implemented."
                    );
            }
        });

        // Make a skill roll
        html.find(".skill-roll").click((ev) => {
            ev.preventDefault();

            const parent = $(ev.currentTarget).parents(".skill-roll-container");
            const main = this.actor.system.attributes[parent.children(".attributeOne")[0].value];
            const sec = this.actor.system.attributes[parent.children(".attributeTwo")[0].value];
            let bonus = parent.children("#skill-bonus")[0].value;

            // Basic error  checking
            if (isNaN(bonus)) {
                bonus = 0;
            }

            fabulaSkillRoll(this.actor, main, sec, bonus);
        });

        // Apply a condition
        html.find(".condition-icon").click(this._onConditionStatusChange.bind(this));
    }

    _onItemCreate(event) {
        event.preventDefault();

        const header = event.currentTarget;
        const type = header.dataset.type;
        const name = `${game.i18n.localize("FU.Items.Types.new")} ${game.i18n.localize(
            "FU.Items.Types." + type
        )}`;

        const itemData = {
            name: name,
            type: type,
            system: {},
        };

        return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    async _onItemEquippedStatusChange(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        try {
            const item = this.actor.items.get(dataset.id);
            var isEquipped = item.system.isEquipped;

            isEquipped = !isEquipped;
            item.update({ data: { isEquipped: isEquipped } });
        } catch (ex) {
            console.log(ex);
        }
    }

    async _onConditionStatusChange(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;
        const condition = this.actor.system.statuses[dataset.condition];
        const effects = this.actor.getEmbeddedCollection("ActiveEffect").contents;
        const relevantEffect = effects.filter((ef) => ef.label === dataset.condition);

        let newValue = !condition;
        let actorProp = { system: { statuses: {} } };
        actorProp.system.statuses[dataset.condition] = newValue;

        if (relevantEffect.length > 0) {
            let effect = relevantEffect[0];
            await effect.update({ disabled: condition });
        } else {
            let data = {
                label: dataset.condition,
                icon: "icons/svg/aura.svg",
                origin: this.actor.uuid,
                disabled: condition,
            };

            switch (dataset.condition) {
                case "dazed":
                    data.changes = [
                        {
                            key: "system.attributes.insight.bonus",
                            mode: 2,
                            value: -2,
                        },
                    ];
                    break;
                case "enraged":
                    data.changes = [
                        {
                            key: "system.attributes.dexterity.bonus",
                            mode: 2,
                            value: -2,
                        },
                        {
                            key: "system.attributes.insight.bonus",
                            mode: 2,
                            value: -2,
                        },
                    ];
                    break;
                case "poisoned":
                    data.changes = [
                        {
                            key: "system.attributes.might.bonus",
                            mode: 2,
                            value: -2,
                        },
                        {
                            key: "system.attributes.willpower.bonus",
                            mode: 2,
                            value: -2,
                        },
                    ];
                    break;
                case "shaken":
                    data.changes = [
                        {
                            key: "system.attributes.willpower.bonus",
                            mode: 2,
                            value: -2,
                        },
                    ];
                    break;
                case "slow":
                    data.changes = [
                        {
                            key: "system.attributes.dexterity.bonus",
                            mode: 2,
                            value: -2,
                        },
                    ];
                    break;
                case "weak":
                    data.changes = [
                        {
                            key: "system.attributes.might.bonus",
                            mode: 2,
                            value: -2,
                        },
                    ];
                    break;
            }
            await this.actor.createEmbeddedDocuments("ActiveEffect", [data]);
        }
        await this.actor.update(actorProp);
    }
}
