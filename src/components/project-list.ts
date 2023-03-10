import { Component } from "./base-component"
import { Project } from "../models/project"
import { DragTarget } from "../models/drag-drop"
import { autobind } from "../decorators/autobind"
import { projectState } from "../state/project"
import { ProjectStatus } from "../models/project"
import { ProjectItem } from "./project-item"

// Project List Class
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
    assignedProjects: Project[]

    constructor(private type: 'active' | 'finished'){
        super("#project-list", "#app", "beforeend", `${type}-projects`)
        this.assignedProjects = []
        this.renderContent()
        this.configure()
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
        if(event.dataTransfer && event.dataTransfer.types[0] === "text/plain"){
            event.preventDefault();
            const listEl = this.element.querySelector("ul");
            listEl?.classList.add("droppable")
        }
    }

    @autobind
    dropHandler(event: DragEvent): void {
        const projId = event.dataTransfer!.getData("text/plain");
        projectState.moveProject(projId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished)
    }

    @autobind
    dragLeaveHandler(event: DragEvent): void {
        const listEl = this.element.querySelector("ul");
        listEl?.classList.remove("droppable")
    }

    configure(): void {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => {
                if(this.type === "active"){
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            })
            this.assignedProjects = relevantProjects
            this.renderProjects()
        })
    }

    renderContent(){
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + 'PROJECTS';
    }

    private renderProjects(){
        const listEl: HTMLUListElement = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        listEl.innerHTML = "";
        for(const item of this.assignedProjects){
            new ProjectItem(this.element.querySelector("ul")!.id, item)
        }
    }
}