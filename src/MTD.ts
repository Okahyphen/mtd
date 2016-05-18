import * as minimist from 'minimist';
import Track from './Track';

module.exports = class MTD {
    public argv: minimist.ParsedArgs;
    public defaults: GenericObject;
    public settings: Settings;
    public tracks: GenericObject;

    private _dispatched: number;
    private _errors: number;
    private _default: string;
    private _always: string[];

    constructor (options?: Option[], args?: string[]) {
        if (!args || args === process.argv) {
            args = process.argv.slice(2);
        }

        const opts: minimist.Options = this.remapOptions(options);
        this.defaults = opts.default;
        delete opts.default;

        this.argv = minimist(args, opts);

        this.settings = {
            multi: true,
            reportErrors: true,
            reruns: false
        };

        this.tracks = {};

        this._always = [];
        this._dispatched = 0;
        this._errors = 0;
    }

    public configure (config: Settings): this {
        for (let key in config) {
            if (config.hasOwnProperty(key) && this.settings.hasOwnProperty(key)) {
                this.settings[key] = config[key];
            }
        }

        return this;
    }

    public track (handle: string, options: Option[], block: Block): this {
        if (this.track.hasOwnProperty(handle)) {
            throw new Error(`Duplicate track ${ handle }`);
        }

        this.tracks[handle] = new Track(handle, options, block);

        return this;
    }

    public default (handle: string, options?: Option[], block?: Block): this {
        if (options || block) {
            this.track(handle, options, block);
        }

        this._default = handle;

        return this;
    }

    public always (handle: string, options: Option[], block: Block): this {
        this.track(handle, options, block);
        this._always.push(handle);

        return this;
    }

    public embark (): void {
        const hasTrack: any = (handle: string): boolean => {
            return this.tracks.hasOwnProperty(handle);
        };

        const lines: string[] = this.argv._.filter(hasTrack);

        const length: number = lines.length;

        if (length) {
            if (this.settings.multi) {
                for (let i: number = 0; i < length; i++) {
                    this.dispatch(this.tracks[lines[i]]);
                }
            } else {
                this.dispatch(this.tracks[lines[0]]);
            }
        }

        if (!this._dispatched && (!this._errors)
            && (this._default !== undefined)
            && this.tracks.hasOwnProperty(this._default)) {
            this.dispatch(this.tracks[this._default]);
        }

        if (this._always.length) {
            this._always.filter(hasTrack).forEach((handle: string): void => {
                this.dispatch(this.tracks[handle]);
            });
        }
    }

    private dispatch (track: Track): void {
        const hasDeparted: boolean = track.departed;

        if (hasDeparted && !this.settings.reruns) {
            return;
        }

        if (!track.cache) {
            track.cache = track.options.map((option: Option): any => {
                return this.argumentFromOption(option, track);
            });
        }

        if (track.missingOptions.length) {
            this.reportErrors(track);
            this._errors++;
        } else {
            if (!hasDeparted) {
                track.departed = true;
            }

            track.block.apply(this, track.cache);

            this._dispatched++;
        }
    }

    private argumentFromOption (option: Option, track: Track): any {
        const optName: string = (
            this.argv.hasOwnProperty(option.$)
                ? option.$
                : (option.alias && this.argv.hasOwnProperty(option.alias))
                    ? option.alias
                    : ''
        );

        if (optName) {
            return this.argv[optName];
        }

        if (option.hasOwnProperty('_')) {
            return option._;
        }

        if (this.defaults.hasOwnProperty(option.$)) {
            return this.defaults[option.$];
        }

        if (option.optional) {
            return;
        }

        track.missingOptions.push(option);
    }

    private remapOptions (options: Option[] = []): minimist.Options {
        const result: minimist.Options = {
            alias: {},
            boolean: [],
            default: {},
            string: []
        };

        options.forEach((option: Option): void => {
            const name: string = option.$;

            if (option.hasOwnProperty('alias')) {
                result.alias[name] = option.alias;
            }

            if (option.hasOwnProperty('_')) {
                result.default[name] = option._;
            }

            if (option.hasOwnProperty('type') &&
                (option.type === 'boolean' || option.type === 'string')) {
                (result as any)[option.type].push(name);
            }
        });

        return result;
    }

    private reportErrors (track: Track): void {
        console.warn(`Track [ ${track.handle} ] missing options:`);

        track.missingOptions.forEach((opt: Option): void => {
            console.warn('\t%s', opt.$);
        });
    }
};
