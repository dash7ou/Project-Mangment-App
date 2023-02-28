// Component Base Class
export abstract class Component <T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateId: string, hostElementID: string, insertPlace: InsertPosition, newElementId?: string
    ){
        this.templateElement = document.querySelector(templateId)!;

        this.hostElement = document.querySelector(hostElementID)!;

        const importedNoted = document.importNode(this.templateElement.content, true);
        this.element = importedNoted.firstElementChild as U;

        if(newElementId){
            this.element.id = newElementId
        }

        this.attach(insertPlace)
    }

    private attach (insertPlace: InsertPosition){
        this.hostElement.insertAdjacentElement(insertPlace, this.element)
    }

    abstract configure(): void;
    abstract renderContent(): void;
}