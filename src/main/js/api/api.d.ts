/// <reference path="lib/Mousetrap.d.ts" />
/// <reference path="lib/jquery.d.ts" />
/// <reference path="lib/jqueryui.d.ts" />
/// <reference path="lib/jquery.simulate.d.ts" />
/// <reference path="lib/codemirror.d.ts" />
/// <reference path="lib/Q.d.ts" />
/// <reference path="lib/slickgrid.d.ts" />
/// <reference path="lib/slickgrid-plugins.d.ts" />
/// <reference path="lib/hasher.d.ts" />
/// <reference path="lib/crossroads.d.ts" />
/// <reference path="lib/jquery.slimscroll.d.ts" />
/// <reference path="lib/noconflict.d.ts" />
/// <reference path="lib/tinymce.d.ts" />
declare module api.util {
    function assert(expression: boolean, message?: string): void;
    function assertState(expression: boolean, message?: string): void;
    function assertNotNull<T>(value: T, message?: string): T;
    function assertNull(value: Object, message?: string): void;
}
declare module api.util {
    class AppHelper {
        static debounce(func: Function, wait: number, immediate?: boolean): (...args: any[]) => void;
        static whileTruthy(initializer: () => any, callback: (value: any) => void): void;
        static preventDragRedirect(message?: String, element?: api.dom.Element): void;
        static dispatchCustomEvent(name: string, element: api.dom.Element): void;
        static focusInOut(element: api.dom.Element, onFocusOut: () => void, wait?: number, preventMouseDown?: boolean): void;
        static lockEvent(event: Event): void;
        static isDirty(element: api.dom.Element): boolean;
    }
}
declare module api.util {
    class ArrayHelper {
        static moveElement(oldIndex: number, newIndex: number, array: any[]): void;
        static addUnique(value: any, array: any[]): void;
        static removeValue(value: any, array: any[]): void;
        static removeDuplicates<T>(array: T[], keyFunction: (item: T) => string): T[];
        static difference<T>(left: T[], right: T[], equals: (valueLeft: T, valueRight: T) => boolean): T[];
        static intersection<T>(left: T[], right: T[], equals: (valueLeft: T, valueRight: T) => boolean): T[];
        static findElementByFieldValue<T>(array: Array<T>, field: string, value: any): T;
    }
}
declare module api.util {
    class BasePath<PATH> {
        private static DEFAULT_ELEMENT_DIVIDER;
        private elementDivider;
        private absolute;
        private elements;
        private refString;
        constructor(elements: string[], elementDivider?: string, absolute?: boolean);
        isAbsolute(): boolean;
        getElements(): string[];
        getElement(index: number): string;
        hasParent(): boolean;
        getParentPath(): PATH;
        newInstance(elements: string[], absolute: boolean): PATH;
        toString(): string;
        static removeEmptyElements(elements: string[]): string[];
    }
}
declare module api.util {
    class UriHelper {
        private static DEFAULT_URI;
        private static DEFAULT_ADMIN_URI;
        /**
         * Creates an URI from supplied path.
         * Expects window.CONFIG to be present.
         *
         * @param path path to append to base URI.
         * @returns {string} the URI (base + path).
         */
        static getUri(path: string): string;
        /**
         * Creates an URI to an admin path.
         *
         * @param path path to append to base admin URI.
         * @returns {string} the URI to a admin path.
         */
        static getAdminUri(path: string): string;
        /**
         * Gets the URI prefix of an admin path.
         *
         * @param path path to append to base admin URI.
         * @returns {string} the URI to a admin path.
         */
        static getAdminUriPrefix(): string;
        /**
         * Creates an URI to a rest service.
         *
         * @param path path to append to base rest URI.
         * @returns {string} the URI to a rest service.
         */
        static getRestUri(path: string): string;
        /**
         * Creates an URI to an admin tool.
         *
         * @param path path to append to base rest URI.
         * @returns {string} the URI to a rest service.
         */
        static getToolUri(path: string): string;
        /**
         * Creates an URI to a portal path.
         *
         * @param path path to append to base portal URI.
         * @returns {string} the URI to a portal path.
         */
        static getPortalUri(path: string): string;
        static relativePath(path: string): string;
        static isNavigatingOutsideOfXP(href: string, contentWindow: Window): boolean;
        static trimWindowProtocolAndPortFromHref(href: string, contentWindow: Window): string;
        static trimAnchor(trimMe: string): string;
        static trimUrlParams(trimMe: string): string;
        static joinPath(...paths: string[]): string;
        static getUrlLocation(url: string): string;
        static decodeUrlParams(url: string): {
            [key: string]: string;
        };
        /**
         * Serializes an object to query string params.
         * Supports nested objects and arrays.
         *
         * @param params
         * @param prefix
         * @returns {string}
         */
        static encodeUrlParams(params: {
            [name: string]: any;
        }, prefix?: string): string;
        static appendUrlParams(url: string, params: {
            [name: string]: any;
        }): string;
    }
}
declare module api.util {
    class StringHelper {
        static EMPTY_STRING: string;
        static SAVE_CHAR_CODES: Object;
        static limit(str: string, length: number, ending?: string): string;
        static capitalize(str: string): string;
        static capitalizeAll(str: string): string;
        static escapeHtml(str: string): string;
        static isUpperCase(str: string): boolean;
        static isLowerCase(str: string): boolean;
        static isMixedCase(str: string): boolean;
        static isEmpty(str: string): boolean;
        static isBlank(str: string): boolean;
        /**
         * Removes carriage characters '\r' from string.
         *
         * Carriage chars could appear before '\n' in multiline strings depending on browser and OS.
         * Useful to clean up value obtained from <textarea>.
         *
         * @param str string to be cleaned up.
         * @returns {string} string without '\r' characters.
         */
        static removeCarriageChars(str: string): string;
        static removeWhitespaces(str: string): string;
        static removeEmptyStrings(elements: string[]): string[];
        static substringBetween(str: string, left: string, right: string): string;
        static testRegex(regex: string, target: string): boolean;
        /**
         * Replaces given tokens in given string.
         * @param str
         * @param tokens
         * @returns {string}
         */
        static format(str: string, ...tokens: any[]): string;
    }
}
declare module api.util {
    class Animation {
        private static DEFAULT_INTERVAL;
        private duration;
        private interval;
        private doStep;
        private id;
        private running;
        constructor(duration: number, interval?: number);
        onStep(doStep: (progress: number) => void): void;
        start(): void;
        stop(): void;
        isRunning(): boolean;
        private getCurrentTime();
    }
}
declare module api.util {
    class CookieHelper {
        static setCookie(name: string, value: string, days?: number): void;
        static getCookie(name: string): string;
        static removeCookie(name: string): void;
        private static escape(value);
        private static unescape(value);
    }
}
declare module api.util {
    class DateHelper {
        static isInvalidDate(value: Date): boolean;
        static getTZOffset(): number;
        static isDST(date: Date): boolean;
        /**
         * Parses passed UTC string into Date object.
         * @param value
         * @returns {Date}
         */
        static makeDateFromUTCString(value: string): Date;
        /**
         * Formats date part of passed date object. Returns string like 2010-01-01
         * @param date
         * @returns {string}
         */
        static formatDate(date: Date): string;
        /**
         * Formats time part of passed date object. Returns string like 10:55:00
         * @param date
         * @param includeSeconds
         * @returns {string}
         */
        static formatTime(date: Date, includeSeconds?: boolean): string;
        private static padNumber(num);
        /**
         * Parses passed iso-like string 2010-01-01 into js date,
         * month expected to be in a 1-12 range
         * @param date
         * @returns {string}
         */
        static parseDate(value: string, dateSeparator?: string, forceDaysBeOfTwoChars?: boolean): Date;
        /**
         * Parses passed value to Time object. Expected format is only 5 chars like '12:10'
         * @param value
         * @returns {*}
         */
        private static parseTime(value);
        /**
         * Parses passed value into Date object. Expected length is 14-16 chars, value should be like '2015-04-17 06:00'
         * @param value
         * @returns {*}
         */
        static parseDateTime(value: string): Date;
        private static parseLongTime(value, timeSeparator?, fractionSeparator?);
        /**
         * Parses passed string with use of given separators. Passed string should not contain timezone.
         * @param value
         * @param dateTimeSeparator
         * @param dateSeparator
         * @param timeSeparator
         * @param fractionSeparator
         * @returns {*}
         */
        static parseLongDateTime(value: string, dateTimeSeparator?: string, dateSeparator?: string, timeSeparator?: string, fractionSeparator?: string): Date;
        /**
         * Returns true if passed string ends with 'z'
         * @param value
         * @returns {number}
         */
        static isUTCdate(value: string): boolean;
        /**
         * E.g. numDaysInMonth(2015, 1) -> 28
         * @param year
         * @param month 0 based month number of the year. 0 === January , 11 === December
         * @returns {number}
         */
        static numDaysInMonth(year: number, month: number): number;
        static getModifiedString(modified: Date): string;
    }
}
declare module api.util {
    class NumberHelper {
        private static MAX_SAFE_INTEGER;
        private static MIN_SAFE_INTEGER;
        static isWholeNumber(value: any): boolean;
        static isNumber(value: any): boolean;
        static randomBetween(from: number, to: number): number;
    }
}
declare module api.util {
    class Flow<RESULT, CONTEXT> {
        private thisOfProducer;
        constructor(thisOfProducer: any);
        getThisOfProducer(): any;
        doExecute(context: CONTEXT): wemQ.Promise<RESULT>;
        doExecuteNext(context: CONTEXT): wemQ.Promise<RESULT>;
    }
}
declare module api.util {
    class Link implements api.Equitable {
        private path;
        constructor(value: string);
        getPath(): string;
        equals(o: Equitable): boolean;
        toString(): string;
    }
}
declare module api.util {
    class DelayedFunctionCall {
        private functionToCall;
        private delay;
        private timerId;
        private context;
        constructor(functionToCall: () => void, context: any, delay?: number);
        delayCall(): void;
    }
}
declare module api.util {
    class GeoPoint implements api.Equitable {
        private latitude;
        private longitude;
        constructor(latitude: number, longitude: number);
        getLatitude(): number;
        getLongitude(): number;
        toString(): string;
        equals(o: api.Equitable): boolean;
        static isValidString(s: string): boolean;
        static fromString(s: string): GeoPoint;
    }
}
declare module api.util {
    class LocalTime implements api.Equitable {
        private static TIME_SEPARATOR;
        private hours;
        private minutes;
        private seconds;
        constructor(builder: LocalTimeBuilder);
        getHours(): number;
        getMinutes(): number;
        getSeconds(): number;
        toString(): string;
        equals(o: api.Equitable): boolean;
        private padNumber(num);
        static isValidString(s: string): boolean;
        static fromString(s: string): LocalTime;
        getAdjustedTime(): {
            hour: number;
            minute: number;
            seconds: number;
        };
        static create(): LocalTimeBuilder;
    }
    class LocalTimeBuilder {
        hours: number;
        minutes: number;
        seconds: number;
        setHours(value: number): LocalTimeBuilder;
        setMinutes(value: number): LocalTimeBuilder;
        setSeconds(value: number): LocalTimeBuilder;
        build(): LocalTime;
    }
}
declare module api.util {
    class LocalDate implements api.Equitable {
        static DATE_SEPARATOR: string;
        private year;
        private month;
        private day;
        constructor(builder: LocalDateBuilder);
        getYear(): number;
        getMonth(): number;
        getDay(): number;
        equals(o: api.Equitable): boolean;
        /** Returns date in ISO format. Month value is incremented because ISO month range is 1-12, whereas JS Date month range is 0-11 */
        toString(): string;
        toDate(): Date;
        private padNumber(num, length?);
        static isValidISODateString(s: string): boolean;
        static fromDate(date: Date): LocalDate;
        static fromISOString(s: string): LocalDate;
        static create(): LocalDateBuilder;
    }
    class LocalDateBuilder {
        year: number;
        month: number;
        day: number;
        setYear(value: number): LocalDateBuilder;
        setMonth(value: number): LocalDateBuilder;
        setDay(value: number): LocalDateBuilder;
        validate(): void;
        build(): LocalDate;
    }
}
declare module api.util {
    class BinaryReference implements api.Equitable {
        private value;
        constructor(value: string);
        getValue(): string;
        equals(o: Equitable): boolean;
        toString(): string;
    }
}
declare module api.util {
    class Reference implements api.Equitable {
        private referenceId;
        constructor(value: string);
        static from(value: api.content.ContentId): Reference;
        getNodeId(): string;
        equals(o: Equitable): boolean;
        toString(): string;
    }
}
declare module api.util {
    class PromiseHelper {
        static newResolvedVoidPromise(): wemQ.Promise<void>;
    }
}
declare module api.util {
    class LocalDateTime implements api.Equitable {
        private static DATE_TIME_SEPARATOR;
        private static DATE_SEPARATOR;
        private static TIME_SEPARATOR;
        private static FRACTION_SEPARATOR;
        private year;
        private month;
        private day;
        private hours;
        private minutes;
        private seconds;
        private fractions;
        constructor(builder: LocalDateTimeBuilder);
        getYear(): number;
        getMonth(): number;
        getDay(): number;
        getHours(): number;
        getMinutes(): number;
        getSeconds(): number;
        getFractions(): number;
        dateToString(): string;
        timeToString(): string;
        toString(): string;
        equals(o: api.Equitable): boolean;
        toDate(): Date;
        private padNumber(num, length?);
        static isValidDateTime(s: string): boolean;
        static fromString(s: string): LocalDateTime;
        static fromDate(s: Date): LocalDateTime;
        static create(): LocalDateTimeBuilder;
    }
    class LocalDateTimeBuilder {
        year: number;
        month: number;
        day: number;
        hours: number;
        minutes: number;
        seconds: number;
        fractions: number;
        setYear(value: number): LocalDateTimeBuilder;
        setMonth(value: number): LocalDateTimeBuilder;
        setDay(value: number): LocalDateTimeBuilder;
        setHours(value: number): LocalDateTimeBuilder;
        setMinutes(value: number): LocalDateTimeBuilder;
        setSeconds(value: number): LocalDateTimeBuilder;
        setFractions(value: number): LocalDateTimeBuilder;
        build(): LocalDateTime;
    }
}
declare module api.util {
    class DateTime implements api.Equitable {
        private static DATE_TIME_SEPARATOR;
        private static DATE_SEPARATOR;
        private static TIME_SEPARATOR;
        private static FRACTION_SEPARATOR;
        private static DEFAULT_TIMEZONE;
        private year;
        private month;
        private day;
        private hours;
        private minutes;
        private seconds;
        private fractions;
        private timezone;
        constructor(builder: DateTimeBuilder);
        getYear(): number;
        getMonth(): number;
        getDay(): number;
        getHours(): number;
        getMinutes(): number;
        getSeconds(): number;
        getFractions(): number;
        getTimezone(): api.util.Timezone;
        dateToString(): string;
        timeToString(): string;
        /** Returns date in ISO format. Month value is incremented because ISO month range is 1-12, whereas JS Date month range is 0-11 */
        toString(): string;
        equals(o: api.Equitable): boolean;
        toDate(): Date;
        private padNumber(num, length?);
        static isValidDateTime(s: string): boolean;
        /**
         * Parsed passed string into DateTime object
         * @param s - date to parse in ISO format
         * @returns {DateTime}
         */
        static fromString(s: string): DateTime;
        static fromDate(s: Date): DateTime;
        static create(): DateTimeBuilder;
        private static parseOffset(value);
        private static trimTZ(dateString);
    }
    class DateTimeBuilder {
        year: number;
        month: number;
        day: number;
        hours: number;
        minutes: number;
        seconds: number;
        fractions: number;
        timezone: Timezone;
        setYear(value: number): DateTimeBuilder;
        setMonth(value: number): DateTimeBuilder;
        setDay(value: number): DateTimeBuilder;
        setHours(value: number): DateTimeBuilder;
        setMinutes(value: number): DateTimeBuilder;
        setSeconds(value: number): DateTimeBuilder;
        setFractions(value: number): DateTimeBuilder;
        setTimezone(value: Timezone): DateTimeBuilder;
        build(): DateTime;
    }
}
declare module api.util {
    function i18nInit(bundle: Object): void;
    function i18n(key: string, ...args: any[]): string;
}
declare module api.util {
    class Timezone implements api.Equitable {
        private offset;
        private location;
        constructor(builder: TimezoneBuilder);
        getOffset(): number;
        getLocation(): string;
        offsetToString(): string;
        toString(): string;
        equals(o: api.Equitable): boolean;
        private padOffset(num, length?);
        static isValidTimezone(s: string): boolean;
        static isValidOffset(s: number): boolean;
        static fromOffset(s: number): Timezone;
        static getLocalTimezone(): Timezone;
        static getZeroOffsetTimezone(): Timezone;
        static create(): TimezoneBuilder;
    }
    class TimezoneBuilder {
        offset: number;
        location: string;
        setOffset(value: number): TimezoneBuilder;
        setLocation(value: string): TimezoneBuilder;
        build(): Timezone;
        buildDefault(): Timezone;
    }
}
declare module api {
    /**
     * An interface telling that the object can be tested whether it's equal to another Equitable or not.
     * Inspired by Java's Object.equals method.
     */
    interface Equitable {
        equals(other: Equitable): boolean;
    }
}
declare module api {
    interface Cloneable {
        /**
         * Returns a new instance of this object and ensures that all member variables that are mutable also are cloned
         * (immutable objects can be reused).
         */
        clone(): any;
    }
}
declare module api {
    class Class {
        private name;
        private fn;
        constructor(name: string, fn: Function);
        getName(): string;
        newInstance(constructorParams?: any): any;
    }
}
declare module api {
    /**
     * Helps with doing a IFRAME-safe instanceof and doing equals on different types of objects.
     */
    class ObjectHelper {
        /**
         * Method to create an object of given class (useful when TS won't allow it, i.e new Event())
         * @param constructor class to use for new object
         * @param args arguments constructor arguments
         * @returns {Object}
         */
        static create(constructor: Function, ...args: any[]): any;
        static iFrameSafeInstanceOf(obj: any, fn: Function): boolean;
        static equals(a: Equitable, b: Equitable): boolean;
        static arrayEquals(arrayA: Equitable[], arrayB: Equitable[]): boolean;
        static anyArrayEquals(arrayA: any[], arrayB: any[]): boolean;
        static mapEquals(mapA: {
            [s: string]: Equitable;
        }, mapB: {
            [s: string]: Equitable;
        }): boolean;
        static stringEquals(a: string, b: string): boolean;
        static stringArrayEquals(arrayA: string[], arrayB: string[]): boolean;
        static booleanEquals(a: boolean, b: boolean): boolean;
        static numberEquals(a: number, b: number): boolean;
        static dateEquals(a: Date, b: Date): boolean;
        static anyEquals(a: any, b: any): boolean;
        static objectEquals(a: Object, b: Object): boolean;
        static contains(array: Equitable[], el: Equitable): boolean;
        static filter(array: Equitable[], el: Equitable): Equitable[];
        static objectPropertyIterator(object: any, callback: {
            (name: string, property: any, index?: number): void;
        }): void;
    }
}
declare module api {
    class ClassHelper {
        static MAX_NEST_LEVEL: number;
        static ALLOWED_PACKAGES: string[];
        /**
         * Returns function name or empty string if function is anonymous.
         *
         * @param func - reference to a function.
         * @returns function name as string.
         */
        static getFunctionName(func: any): string;
        /**
         * Returns name of function which was used to create this instance.
         * In case of using typescript it returns typescript class name.
         *
         * @param instance of typescript class.
         * @returns {string} class name.
         */
        static getClassName(instance: any): string;
        /**
         * Returns function which was used to create this instance.
         * In case of using typescript it returns typescript class.
         *
         * @param instance object
         * @returns {function} class
         */
        static getClass(instance: any): Function;
        /**
         * Returns full module path to given object or class.
         *
         * @param instance - reference to class or it's instance.
         * @returns {string} full module name.
         */
        static getModuleName(instance: any): string;
        /**
         * Returns full class name including full path to the class and class name.
         *
         * @param instance - reference to class, its instance or exported function.
         * @returns {string} full class name.
         */
        static getFullName(instance: any): string;
        /**
         * Recursively looks through the objects tree searching for the given constructor function.
         *
         * @param obj - top level object to iterate through its keys.
         * @param constructor - function which is looking for to resolve its path.
         * @param nestLevel - current level of recursive calls.
         * @returns {string} full name included modules and class name.
         */
        static findPath(obj: Object, constructor: Function, nestLevel?: number): string;
        /**
         * Calculates the number of super classes between given instance and clazz.
         */
        static distanceTo(instance: any, clazz: Function): number;
    }
}
declare module api {
    class BrowserHelper {
        private static AVAILABLE_VERSIONS;
        private static BROWSER_NAME;
        private static BROWSER_VERSION;
        private static IS_IE;
        static isAvailableBrowser(): boolean;
        static isOldBrowser(): boolean;
        static isIE(): boolean;
        static isOSX(): boolean;
        static isIOS(): boolean;
        static isFirefox(): boolean;
        static isSafari(): boolean;
        static isAndroid(): boolean;
        static isMobile(): boolean;
        private static init();
    }
}
declare module api {
    interface Comparator<T> {
        compare(a: T, b: T): number;
    }
}
declare module api {
    class NamePrettyfier {
        private static STRIP_BEGINNING_PATTERN;
        private static STRIP_ENDING_PATTERN;
        private static NOT_ASCII;
        private static DEFAULT_REPLACE;
        private static REPLACE_WITH_HYPHEN_CHARS;
        private static DIACRITICS;
        private static NON_DIACRITICS;
        static prettify(notPretty: string): string;
        private static makeLowerCase(prettifiedName);
        private static replaceWithHyphens(prettifiedName);
        private static replaceBlankSpaces(prettifiedName);
        private static isCurrencyChar(char);
        private static replaceTrailingHyphens(prettifiedName);
        private static replaceHyphensAroundDot(prettifiedName);
        private static ensureNiceBeginningAndEnding(prettifiedName);
        private static transcribe(transcribeMe);
        private static buildDiacriticsMap();
        private static buildReplaceWithHyphenMap();
        private static buildNonDiacriticsMap();
    }
}
declare module api {
    class Name implements api.Equitable {
        static FORBIDDEN_CHARS: RegExp;
        static SIMPLIFIED_FORBIDDEN_CHARS: RegExp;
        private value;
        constructor(name: string);
        getValue(): string;
        toString(): string;
        equals(o: api.Equitable): boolean;
    }
}
declare module api {
    enum ExceptionType {
        INFO = 0,
        ERROR = 1,
        WARNING = 2,
    }
    class Exception {
        private message;
        private type;
        constructor(message: string, type?: ExceptionType);
        getMessage(): string;
        getType(): ExceptionType;
    }
}
declare module api {
    class AccessDeniedException extends Exception {
        constructor(message: string);
    }
}
declare module api {
    class DefaultErrorHandler {
        static handle(error: any): void;
    }
}
declare module api {
    /**
     * An event representing that a property of an object have changed.
     */
    class PropertyChangedEvent {
        private propertyName;
        private oldValue;
        private newValue;
        private source;
        constructor(propertyName: string, oldValue: any, newValue: any, source?: any);
        getPropertyName(): string;
        getOldValue(): any;
        getNewValue(): any;
        getSource(): any;
    }
}
declare module api {
    class ValidityChangedEvent {
        private valid;
        constructor(valid: boolean);
        isValid(): boolean;
    }
}
declare module api {
    class ValueChangedEvent {
        private oldValue;
        private newValue;
        constructor(oldValue?: string, newValue?: string);
        getOldValue(): string;
        getNewValue(): string;
        valuesAreEqual(): boolean;
    }
}
declare module api {
    class StyleHelper {
        static COMMON_PREFIX: string;
        static ADMIN_PREFIX: string;
        static PAGE_EDITOR_PREFIX: string;
        static ICON_PREFIX: string;
        static currentPrefix: string;
        static setCurrentPrefix(prefix: string): void;
        static getCurrentPrefix(): string;
        static getCls(cls: string, prefix?: string): string;
        static getIconCls(iconCls: string): string;
        static getCommonIconCls(iconCls: string): string;
        private static isPrefixed(cls, prefix);
    }
}
declare module api.util.loader.event {
    class LoaderEvent {
        private postLoad;
        constructor(postLoad?: boolean);
        isPostLoad(): boolean;
    }
}
declare module api.util.loader.event {
    class LoaderErrorEvent extends LoaderEvent {
        private statusCode;
        private textStatus;
        constructor(statusCode: number, textStatus: string, postLoad?: boolean);
        getStatusCode(): number;
        getTextStatus(): string;
    }
}
declare module api.util.loader.event {
    class LoadedDataEvent<V> extends LoaderEvent {
        private data;
        constructor(data: V[], postLoad?: boolean);
        getData(): V[];
    }
}
declare module api.util.loader.event {
    class LoadingDataEvent extends LoaderEvent {
        constructor(postLoad?: boolean);
    }
}
declare module api.util.loader.event {
    enum LoaderEvents {
        LoadedData = 0,
        LoadingData = 1,
    }
}
declare module api.util.loader {
    import LoadedDataEvent = api.util.loader.event.LoadedDataEvent;
    import LoadingDataEvent = api.util.loader.event.LoadingDataEvent;
    import LoaderErrorEvent = api.util.loader.event.LoaderErrorEvent;
    class BaseLoader<JSON, OBJECT> {
        protected request: api.rest.ResourceRequest<JSON, OBJECT[]>;
        private status;
        private results;
        private searchString;
        private loadedDataListeners;
        private loadingDataListeners;
        private loaderErrorListeners;
        private comparator;
        constructor(request?: api.rest.ResourceRequest<JSON, OBJECT[]>);
        protected createRequest(): api.rest.ResourceRequest<JSON, OBJECT[]>;
        protected getRequest(): api.rest.ResourceRequest<JSON, OBJECT[]>;
        sendRequest(): wemQ.Promise<OBJECT[]>;
        load(postLoad?: boolean): wemQ.Promise<OBJECT[]>;
        preLoad(searchString?: string): wemQ.Promise<OBJECT[]>;
        protected sendPreLoadRequest(searchString?: string): wemQ.Promise<OBJECT[]>;
        private handleLoadSuccess(postLoad, results);
        private handleLoadError(postLoad, error);
        isLoading(): boolean;
        isLoaded(): boolean;
        isNotStarted(): boolean;
        setComparator(comparator: Comparator<OBJECT>): BaseLoader<JSON, OBJECT>;
        setRequest(request: api.rest.ResourceRequest<JSON, OBJECT[]>): void;
        search(searchString: string): wemQ.Promise<OBJECT[]>;
        getResults(): OBJECT[];
        setResults(results: OBJECT[]): void;
        getComparator(): Comparator<OBJECT>;
        getSearchString(): string;
        filterFn(result: OBJECT): boolean;
        notifyLoadedData(results: OBJECT[], postLoad?: boolean): void;
        notifyLoadingData(postLoad?: boolean): void;
        onLoadedData(listener: (event: LoadedDataEvent<OBJECT>) => void): void;
        onLoadingData(listener: (event: LoadingDataEvent) => void): void;
        unLoadedData(listener: (event: LoadedDataEvent<OBJECT>) => void): void;
        unLoadingData(listener: (event: LoadingDataEvent) => void): void;
        onErrorOccurred(listener: (event: LoaderErrorEvent) => void): void;
        unErrorOccurred(listener: (event: LoaderErrorEvent) => void): void;
        notifyErrorOccurred(statusCode: number, textStatus: string, postLoad?: boolean): void;
    }
}
declare module api.util.loader {
    class PostLoader<JSON, OBJECT> extends BaseLoader<JSON, OBJECT> {
        private isPostLoading;
        sendRequest(): wemQ.Promise<OBJECT[]>;
        resetParams(): void;
        isPartiallyLoaded(): boolean;
        postLoad(): void;
    }
}
declare module api.util.loader {
    class ImageLoader {
        private static cachedImages;
        static get(url: string, width?: number, height?: number): HTMLImageElement;
    }
}
declare module api.cache {
    class Cache<T, KEY> {
        private objectsByKey;
        private loading;
        private loadedListeners;
        getAll(): T[];
        copy(object: T): T;
        getKeyFromObject(object: T): KEY;
        getKeyAsString(object: KEY): string;
        isOnLoading(key: KEY): boolean;
        addToLoading(key: KEY): void;
        getOnLoaded(key: KEY): wemQ.Promise<T>;
        put(object: T): void;
        deleteByKey(key: KEY): void;
        getByKey(key: KEY): T;
        private notifyLoaded(keyStr, value);
        private onLoaded(listener);
        private unLoaded(listener);
    }
}
declare module api.event {
    class Event {
        private name;
        constructor(name?: string);
        getName(): string;
        fire(contextWindow?: Window): void;
        static bind(name: string, handler: (event: Event) => void, contextWindow?: Window): void;
        static unbind(name: string, handler?: (event: Event) => void, contextWindow?: Window): void;
    }
}
declare module api.event {
    class EventBus {
        private static handlersMap;
        static onEvent(eventName: string, handler: (apiEventObj: api.event.Event) => void, contextWindow?: Window): void;
        static unEvent(eventName: string, handler?: (event: api.event.Event) => void, contextWindow?: Window): void;
        static fireEvent(apiEventObj: api.event.Event, contextWindow?: Window): void;
    }
}
declare module api.event {
    interface NodeEventJson extends EventJson {
        data: NodeEventDataJson;
    }
    interface NodeEventDataJson {
        nodes: NodeEventNodeJson[];
    }
    interface NodeEventNodeJson {
        id: string;
        path: string;
        newPath: string;
        branch: string;
    }
    class NodeServerEvent extends Event {
        private change;
        constructor(change: NodeServerChange<any>);
        getNodeChange(): NodeServerChange<any>;
        static is(eventJson: api.event.NodeEventJson): boolean;
        toString(): string;
        static on(handler: (event: NodeServerEvent) => void): void;
        static un(handler?: (event: NodeServerEvent) => void): void;
        static fromJson(nodeEventJson: NodeEventJson): NodeServerEvent;
    }
}
declare module api.event {
    enum NodeServerChangeType {
        UNKNOWN = 0,
        PUBLISH = 1,
        DUPLICATE = 2,
        CREATE = 3,
        UPDATE = 4,
        DELETE = 5,
        PENDING = 6,
        RENAME = 7,
        SORT = 8,
        MOVE = 9,
    }
    class NodeServerChangeItem<PATH_TYPE> {
        path: PATH_TYPE;
        branch: string;
        constructor(path: PATH_TYPE, branch: string);
        getPath(): PATH_TYPE;
        getBranch(): string;
    }
    class NodeServerChange<PATH_TYPE> {
        protected changeItems: NodeServerChangeItem<PATH_TYPE>[];
        protected newNodePaths: PATH_TYPE[];
        protected type: NodeServerChangeType;
        constructor(type: NodeServerChangeType, changeItems: NodeServerChangeItem<PATH_TYPE>[], newNodePaths: PATH_TYPE[]);
        getChangeItems(): NodeServerChangeItem<PATH_TYPE>[];
        getNewPaths(): PATH_TYPE[];
        getChangeType(): NodeServerChangeType;
        protected static getNodeServerChangeType(value: string): NodeServerChangeType;
        static fromJson(nodeEventJson: NodeEventJson): NodeServerChange<any>;
    }
}
declare module api.event {
    interface EventJson {
        type: string;
        timestamp: number;
    }
}
declare module api.dom {
    class WindowDOM {
        private el;
        private static instance;
        private onBeforeUnloadListeners;
        private onUnloadListeners;
        static get(): WindowDOM;
        constructor();
        asWindow(): Window;
        getTopParent(): WindowDOM;
        getParent(): WindowDOM;
        isInIFrame(): boolean;
        getFrameElement(): HTMLElement;
        getHTMLElement(): HTMLElement;
        getScrollTop(): number;
        onResized(listener: (event: UIEvent) => void, element?: api.dom.Element): void;
        unResized(listener: (event: UIEvent) => void): void;
        getWidth(): number;
        getHeight(): number;
        onScroll(listener: (event: UIEvent) => void, element?: api.dom.Element): void;
        unScroll(listener: (event: UIEvent) => void): void;
        onBeforeUnload(listener: (event: UIEvent) => void): void;
        unBeforeUnload(listener: (event: UIEvent) => void): this;
        onUnload(listener: (event: UIEvent) => void): void;
        unUnload(listener: (event: UIEvent) => void): this;
    }
}
declare module api.dom {
    interface ElementDimensions {
        top: number;
        left: number;
        width: number;
        height: number;
    }
    class ElementHelper {
        private el;
        static fromName(name: string): ElementHelper;
        constructor(element: HTMLElement);
        getHTMLElement(): HTMLElement;
        insertBefore(newEl: Element, existingEl: Element): void;
        insertBeforeEl(existingEl: ElementHelper): void;
        insertAfterEl(existingEl: ElementHelper): void;
        insertAfterThisEl(toInsert: ElementHelper): void;
        getPrevious(): ElementHelper;
        getNext(): ElementHelper;
        getParent(): ElementHelper;
        setDisabled(value: boolean): ElementHelper;
        isDisabled(): boolean;
        getId(): string;
        setId(value: string): ElementHelper;
        simulate(value: string): ElementHelper;
        setInnerHtml(value: string, escapeHtml?: boolean): ElementHelper;
        getInnerHtml(): string;
        setText(value: string): ElementHelper;
        getText(): string;
        setAttribute(name: string, value: string): ElementHelper;
        getAttribute(name: string): string;
        hasAttribute(name: string): boolean;
        removeAttribute(name: string): ElementHelper;
        setData(name: string, value: string): ElementHelper;
        getData(name: string): string;
        getValue(): string;
        setValue(value: string): ElementHelper;
        toggleClass(className: string, condition?: boolean): ElementHelper;
        addClass(clsName: string): ElementHelper;
        setClass(value: string): ElementHelper;
        getClass(): string;
        setTitle(value: string): ElementHelper;
        getTitle(): string;
        hasAnyParentClass(clsName: string): boolean;
        hasClass(clsName: string): boolean;
        removeClass(clsName: string): ElementHelper;
        addEventListener(eventName: string, f: (event: Event) => any): ElementHelper;
        removeEventListener(eventName: string, f: (event: Event) => any): ElementHelper;
        appendChild(child: Node): ElementHelper;
        appendChildren(children: Node[]): ElementHelper;
        insertChild(child: Node, index: number): ElementHelper;
        getTagName(): string;
        getDisplay(): string;
        setDisplay(value: string): ElementHelper;
        getOpacity(): number;
        setOpacity(value: number): ElementHelper;
        getVisibility(): string;
        setVisibility(value: string): ElementHelper;
        getPosition(): string;
        setPosition(value: string): ElementHelper;
        setWidth(value: string): ElementHelper;
        setWidthPx(value: number): ElementHelper;
        setMaxWidth(value: string): ElementHelper;
        setMaxWidthPx(value: number): ElementHelper;
        getWidth(): number;
        getWidthWithoutPadding(): number;
        getWidthWithBorder(): number;
        getWidthWithMargin(): number;
        getMinWidth(): number;
        getMaxWidth(): number;
        setHeight(value: string): ElementHelper;
        setHeightPx(value: number): ElementHelper;
        getHeight(): number;
        setMaxHeight(value: string): ElementHelper;
        setMaxHeightPx(value: number): ElementHelper;
        setMinHeight(value: string): ElementHelper;
        setMinHeightPx(value: number): ElementHelper;
        getHeightWithoutPadding(): number;
        getHeightWithBorder(): number;
        getHeightWithMargin(): number;
        setTop(value: string): ElementHelper;
        setTopPx(value: number): ElementHelper;
        getTopPx(): number;
        getTop(): string;
        setBottom(value: string): ElementHelper;
        setBottomPx(value: number): ElementHelper;
        getLeft(): string;
        getLeftPx(): number;
        setLeftPx(value: number): ElementHelper;
        setLeft(value: string): ElementHelper;
        setRight(value: string): ElementHelper;
        setRightPx(value: number): ElementHelper;
        getMarginLeft(): number;
        setMarginLeft(value: string): ElementHelper;
        getMarginRight(): number;
        setMarginRight(value: string): ElementHelper;
        getMarginTop(): number;
        setMarginTop(value: string): ElementHelper;
        getMarginBottom(): number;
        setMarginBottom(value: string): ElementHelper;
        setStroke(value: string): ElementHelper;
        getStroke(): string;
        setStrokeDasharray(value: string): ElementHelper;
        getStrokeDasharray(): string;
        setFill(value: string): ElementHelper;
        getFill(): string;
        getPaddingLeft(): number;
        setPaddingLeft(value: string): ElementHelper;
        getPaddingRight(): number;
        setPaddingRight(value: string): ElementHelper;
        getPaddingTop(): number;
        setPaddingTop(value: string): ElementHelper;
        getPaddingBottom(): number;
        setPaddingBottom(value: string): ElementHelper;
        getBorderTopWidth(): number;
        getBorderBottomWidth(): number;
        getBorderRightWidth(): number;
        getBorderLeftWidth(): number;
        setZindex(value: number): ElementHelper;
        getBoundingClientRect(): ClientRect;
        scrollIntoView(top?: boolean): ElementHelper;
        getScrollTop(): number;
        setScrollTop(top: number): ElementHelper;
        getTabIndex(): number;
        setTabIndex(tabIndex: number): ElementHelper;
        getFontSize(): string;
        setFontSize(value: string): ElementHelper;
        setBackgroundImage(value: string): ElementHelper;
        setCursor(value: string): ElementHelper;
        getCursor(): string;
        getElementsByClassName(className: string): ElementHelper[];
        remove(): void;
        contains(element: HTMLElement): boolean;
        /**
         * Calculate offset relative to document
         * @returns {{left: number, top: number}}
         */
        getOffset(): {
            top: number;
            left: number;
        };
        setOffset(offset: {
            top: number;
            left: number;
        }): ElementHelper;
        getDimensions(): ElementDimensions;
        getDimensionsTopRelativeToParent(): ElementDimensions;
        /**
         * Goes up the hierarchy and returns first non-statically positioned parent
         * @returns {HTMLElement}
         */
        getOffsetParent(): HTMLElement;
        /**
         * Calculates offset relative to first positioned parent ( element with position: relative, absolute or fixed )
         * @returns {{top: number, left: number}}
         */
        getOffsetToParent(): {
            top: number;
            left: number;
        };
        getOffsetTop(): number;
        getOffsetTopRelativeToParent(): number;
        getOffsetLeft(): number;
        getOffsetLeftRelativeToParent(): number;
        isScrollable(): boolean;
        getComputedProperty(name: string, pseudoElement?: string): string;
        focus(): void;
        blur(): void;
        /**
         * Returns the index of this element among it's siblings. Returns 0 if first or only child.
         */
        getSiblingIndex(): number;
        isVisible(): boolean;
        countChildren(): number;
        getChild(index: number): Node;
        getChildren(): Node[];
        isOverflown(): boolean;
    }
}
declare module api.dom {
    class ImgHelper extends ElementHelper {
        private imgEl;
        static create(): ElementHelper;
        constructor(element: HTMLImageElement);
        getHTMLElement(): HTMLImageElement;
        setSrc(value: string): ImgHelper;
        getSrc(): string;
        getCurrentSrc(): string;
        getNaturalWidth(): number;
        getNaturalHeight(): number;
    }
}
declare module api.dom {
    class ElementBuilder {
        generateId: boolean;
        className: string;
        parentElement: Element;
        private getParsedClass(cls);
        setGenerateId(value: boolean): ElementBuilder;
        setClassName(cls: string, prefix?: string): ElementBuilder;
        setParentElement(element: Element): ElementBuilder;
    }
    class ElementFromElementBuilder extends ElementBuilder {
        element: Element;
        setElement(element: Element): ElementFromElementBuilder;
    }
    class ElementFromHelperBuilder extends ElementBuilder {
        helper: ElementHelper;
        loadExistingChildren: boolean;
        setHelper(helper: ElementHelper): ElementFromHelperBuilder;
        setLoadExistingChildren(value: boolean): ElementFromHelperBuilder;
    }
    class NewElementBuilder extends ElementBuilder {
        tagName: string;
        helper: ElementHelper;
        setTagName(name: string): NewElementBuilder;
        setHelper(helper: ElementHelper): NewElementBuilder;
    }
    class Element {
        private el;
        private parentElement;
        private children;
        private rendered;
        private rendering;
        private childrenAddedDuringInit;
        static debug: boolean;
        private addedListeners;
        private removedListeners;
        private renderedListeners;
        private shownListeners;
        private hiddenListeners;
        constructor(builder: ElementBuilder);
        private replaceChildElement(replacementChild, existingChild);
        loadExistingChildren(): Element;
        findChildById(id: string, deep?: boolean): Element;
        /**
         * Inits element by rendering element first,
         * then all its children,
         * and then throwing the rendered (and shown) events
         * @returns {Promise<boolean>}
         */
        protected init(): wemQ.Promise<boolean>;
        private initChildren(rendered);
        /**
         * Renders the element,
         * then all its children,
         * and throws rendered event after that
         * @param deep tells if all the children should be rendered as well
         * @returns {Promise<boolean>}
         */
        render(deep?: boolean): wemQ.Promise<boolean>;
        isRendering(): boolean;
        isRendered(): boolean;
        isAdded(): boolean;
        /**
         * Do all the element rendering here
         * Return false to tell that rendering failed
         * @returns {Q.Promise<boolean>}
         */
        doRender(): wemQ.Promise<boolean>;
        show(): void;
        hide(skipAnimation?: boolean): void;
        setVisible(value: boolean): Element;
        isVisible(): boolean;
        setClass(className: string): Element;
        setClassEx(className: string): Element;
        addClass(className: string): Element;
        addClassEx(className: string): Element;
        toggleClass(className: string, condition?: boolean): Element;
        toggleClassEx(className: string, condition?: boolean): Element;
        hasClass(className: string): boolean;
        hasClassEx(className: string): boolean;
        removeClass(className: string): Element;
        removeClassEx(className: string): Element;
        getClass(): string;
        getId(): string;
        setId(value: string): Element;
        getEl(): ElementHelper;
        traverse(handler: (el: Element) => void): void;
        setDraggable(value: boolean): void;
        isDraggable(): boolean;
        setContentEditable(flag: boolean): ArticleEl;
        isContentEditable(): boolean;
        giveFocus(): boolean;
        giveBlur(): boolean;
        getHTMLElement(): HTMLElement;
        insertChild<T extends Element>(child: T, index: number): Element;
        appendChild<T extends Element>(child: T): Element;
        appendChildren<T extends Element>(...children: T[]): Element;
        prependChild(child: Element): Element;
        insertAfterEl(existing: Element): Element;
        insertBeforeEl(existing: Element): Element;
        hasChild(child: Element): boolean;
        removeChild(child: Element): Element;
        removeChildren(): Element;
        private insertChildElement(child, parent, index?);
        private removeChildElement(child);
        private registerChildElement(child, index?);
        private unregisterChildElement(child);
        contains(element: Element): boolean;
        remove(): Element;
        replaceWith(replacement: Element): void;
        wrapWithElement(wrapperElement: Element): void;
        getParentElement(): Element;
        getChildren(): Element[];
        getLastChild(): Element;
        getFirstChild(): Element;
        getNextElement(): Element;
        getPreviousElement(): Element;
        /**
         * Returns the index of this element among it's siblings. Returns 0 if first or only child.
         */
        getSiblingIndex(): number;
        getTabbableElements(): Element[];
        toString(): string;
        getHtml(): string;
        setHtml(value: string, escapeHtml?: boolean): Element;
        private mouseEnterByHandler;
        onMouseEnter(handler: (e: MouseEvent) => any): void;
        unMouseEnter(handler: (e: MouseEvent) => any): void;
        private mouseLeaveByHandler;
        onMouseLeave(handler: (e: MouseEvent) => any): void;
        unMouseLeave(handler: (e: MouseEvent) => any): void;
        onMouseOver(listener: (e: MouseEvent) => any): void;
        unMouseOver(listener: (event: MouseEvent) => void): void;
        onMouseOut(listener: (e: MouseEvent) => any): void;
        unMouseOut(listener: (event: MouseEvent) => void): void;
        onAdded(listener: (event: ElementAddedEvent) => void): void;
        unAdded(listener: (event: ElementAddedEvent) => void): void;
        private notifyAdded();
        onRemoved(listener: (event: ElementRemovedEvent) => void): void;
        unRemoved(listener: (event: ElementRemovedEvent) => void): void;
        private notifyRemoved(parent, target?);
        onRendered(listener: (event: ElementRenderedEvent) => void): void;
        unRendered(listener: (event: ElementRenderedEvent) => void): void;
        private notifyRendered();
        onShown(listener: (event: ElementShownEvent) => void): void;
        unShown(listener: (event: ElementShownEvent) => void): void;
        private notifyShown(target?, deep?);
        onHidden(listener: (event: ElementHiddenEvent) => void): void;
        unHidden(listener: (event: ElementHiddenEvent) => void): void;
        private notifyHidden(target?);
        onScrolled(listener: (event: WheelEvent) => void): void;
        unScrolled(listener: (event: WheelEvent) => void): void;
        onClicked(listener: (event: MouseEvent) => void): void;
        unClicked(listener: (event: MouseEvent) => void): void;
        onDblClicked(listener: (event: MouseEvent) => void): void;
        unDblClicked(listener: (event: MouseEvent) => void): void;
        onContextMenu(listener: (event: MouseEvent) => void): void;
        unContextMenu(listener: (event: MouseEvent) => void): void;
        onMouseDown(listener: (event: MouseEvent) => void): void;
        unMouseDown(listener: (event: MouseEvent) => void): void;
        onMouseUp(listener: (event: MouseEvent) => void): void;
        unMouseUp(listener: (event: MouseEvent) => void): void;
        onMouseMove(listener: (event: MouseEvent) => void): void;
        unMouseMove(listener: (event: MouseEvent) => void): void;
        onMouseWheel(listener: (event: WheelEvent) => void): void;
        unMouseWheel(listener: (event: MouseEvent) => void): void;
        onTouchStart(listener: (event: MouseEvent) => void): void;
        unTouchStart(listener: (event: MouseEvent) => void): void;
        onKeyUp(listener: (event: KeyboardEvent) => void): void;
        unKeyUp(listener: (event: KeyboardEvent) => void): void;
        onKeyDown(listener: (event: KeyboardEvent) => void): void;
        unKeyDown(listener: (event: KeyboardEvent) => void): void;
        onKeyPressed(listener: (event: KeyboardEvent) => void): void;
        unKeyPressed(listener: (event: KeyboardEvent) => void): void;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        onFocusIn(listener: (event: any) => void): void;
        unFocusIn(listener: (event: any) => void): void;
        onFocusOut(listener: (event: any) => void): void;
        unFocusOut(listener: (event: any) => void): void;
        onScroll(listener: (event: Event) => void): void;
        unScroll(listener: (event: Event) => void): void;
        onDrag(listener: (event: DragEvent) => void): void;
        unDrag(listener: (event: DragEvent) => void): void;
        onDragStart(listener: (event: DragEvent) => void): void;
        unDragStart(listener: (event: DragEvent) => void): void;
        onDragEnter(listener: (event: DragEvent) => void): void;
        unDragEnter(listener: (event: DragEvent) => void): void;
        onDragOver(listener: (event: DragEvent) => void): void;
        unDragOver(listener: (event: DragEvent) => void): void;
        onDragOut(listener: (event: DragEvent) => void): void;
        unDragOut(listener: (event: DragEvent) => void): void;
        onDragLeave(listener: (event: DragEvent) => void): void;
        unDragLeave(listener: (event: DragEvent) => void): void;
        onDrop(listener: (event: DragEvent) => void): void;
        unDrop(listener: (event: DragEvent) => void): void;
        onDragEnd(listener: (event: DragEvent) => void): void;
        unDragEnd(listener: (event: DragEvent) => void): void;
        static fromHtmlElement(element: HTMLElement, loadExistingChildren?: boolean, parent?: Element): Element;
        static fromString(s: string, loadExistingChildren?: boolean): Element;
        static fromSelector(s: string, loadExistingChildren?: boolean): Element[];
    }
}
declare module api.dom {
    class ElementRegistry {
        private static counters;
        private static elements;
        static registerElement(el: api.dom.Element): string;
        static unregisterElement(el: api.dom.Element): void;
        static getElementById(id: string): api.dom.Element;
        static getElementCountById(id: string): number;
    }
}
declare module api.dom {
    class ElementEvent extends api.event.Event {
        private element;
        private target;
        constructor(name: string, element: Element, target?: Element);
        getElement(): Element;
        getTarget(): Element;
    }
}
declare module api.dom {
    class ElementAddedEvent extends ElementEvent {
        constructor(element: Element, target?: Element);
    }
}
declare module api.dom {
    class ElementRenderedEvent extends ElementEvent {
        constructor(element: Element, target?: Element);
    }
}
declare module api.dom {
    class ElementShownEvent extends ElementEvent {
        constructor(element: Element, target?: Element);
    }
}
declare module api.dom {
    class ElementHiddenEvent extends ElementEvent {
        constructor(element: Element, target?: Element);
    }
}
declare module api.dom {
    class ElementRemovedEvent extends ElementEvent {
        private parent;
        constructor(element: Element, parent: Element, target?: Element);
        getParent(): Element;
    }
}
declare module api.dom {
    class ElementResizedEvent extends ElementEvent {
        private newWidth;
        private newHeight;
        constructor(newWidth: number, newHeight: number, element: Element, target?: Element);
        getNewWidth(): number;
        getNewHeight(): number;
    }
}
declare module api.dom {
    class AEl extends Element {
        constructor(className?: string);
        setUrl(value: string, target?: string): AEl;
        setTitle(value: string): AEl;
        getTitle(): string;
        getHref(): string;
        getTarget(): string;
        getText(): string;
    }
}
declare module api.dom {
    class BrEl extends Element {
        constructor();
    }
}
declare module api.dom {
    class IEl extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class Body extends Element {
        private static instance;
        private childrenLoaded;
        constructor(loadExistingChildren?: boolean, body?: HTMLElement);
        static get(): Body;
        isChildrenLoaded(): boolean;
        loadExistingChildren(): Body;
        isShowingModalDialog(): boolean;
    }
}
declare module api.dom {
    class DivEl extends Element {
        constructor(className?: string, prefix?: string);
    }
}
declare module api.dom {
    class H1El extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class H2El extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class H3El extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class H4El extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class H5El extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class H6El extends Element {
        constructor(className?: string, prefix?: string);
    }
}
declare module api.dom {
    class UlEl extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class LiEl extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class EmEl extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class ImgEl extends Element {
        private loaded;
        private loadedListeners;
        private errorListeners;
        static debug: boolean;
        static PLACEHOLDER: string;
        constructor(src?: string, className?: string, usePlaceholder?: boolean);
        refresh(): void;
        getSrc(): string;
        getCurrentSrc(): string;
        setSrc(source: string): void;
        getEl(): ImgHelper;
        onLoaded(listener: (event: UIEvent) => void): void;
        onError(listener: (event: UIEvent) => void): void;
        unLoaded(listener: (event: UIEvent) => void): void;
        unError(listener: (event: UIEvent) => void): void;
        private notifyLoaded(event);
        private notifyError(event);
        private onImgElLoaded(listener);
        private onImgElError(listener);
        isLoaded(): boolean;
        isPlaceholder(): boolean;
    }
}
declare module api.dom {
    class SpanEl extends Element {
        constructor(className?: string, prefix?: string);
    }
}
declare module api.dom {
    class FormItemEl extends Element {
        private validityChangedListeners;
        constructor(tagName: string, className?: string, prefix?: string);
        getName(): string;
        setName(name: string): FormItemEl;
        onValidityChanged(listener: (event: ValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: ValidityChangedEvent) => void): void;
        notifyValidityChanged(valid: boolean): void;
    }
}
declare module api.dom {
    class ButtonEl extends FormItemEl {
        constructor(className?: string);
    }
}
declare module api.dom {
    class PEl extends Element {
        constructor(className?: string, prefix?: string);
    }
}
declare module api.dom {
    class FormInputEl extends FormItemEl {
        private dirtyChangedListeners;
        private valueChangedListeners;
        private originalValue;
        private oldValue;
        private dirty;
        private readOnly;
        static debug: boolean;
        constructor(tagName: string, className?: string, prefix?: string, originalValue?: string);
        setReadOnly(readOnly: boolean): void;
        isReadOnly(): boolean;
        getValue(): string;
        protected getOriginalValue(): string;
        /**
         * Gets value of the input (i.e gets checked for checkbox, instead of the value attribute)
         * @returns {string}
         */
        protected doGetValue(): string;
        /**
         * Takes care of the set value routine.
         * Note that it behaves differently for different elements:
         * "button", "reset", and "submit" - defines the text on the button
         * "text", "password", and "hidden" - defines the initial (default) value
         * "checkbox", "radio", "image" - defines the value sent on submit
         * @param value
         * @param silent
         * @param userInput indicates that dirty flag should be updated,
         * otherwise original value will be updated if not dirty
         * @returns {api.dom.FormInputEl}
         */
        setValue(value: string, silent?: boolean, userInput?: boolean): FormInputEl;
        /**
         * Does actual value setting (i.e sets input value, or checked for checkbox, instead of value attribute)
         * all necessary events are thrown in wrapping setValue
         * @param value
         * @param silent
         */
        protected doSetValue(value: string, silent?: boolean): void;
        isDirty(): boolean;
        toString(): string;
        resetBaseValues(): void;
        private calculateDirty();
        private setDirty(dirty, silent?);
        protected isSameValueUpdateAllowed(): boolean;
        /**
         * Call to refresh dirty state and fire an event if input was changed outside setValue
         * @param silent
         */
        protected refreshDirtyState(silent?: boolean): void;
        /**
         * Call to refresh old value and fire an event if input was changed outside setValue
         * @param silent
         */
        protected refreshValueChanged(silent?: boolean): void;
        onChange(listener: (event: Event) => void): void;
        unChange(listener: (event: Event) => void): void;
        onInput(listener: (event: Event) => void): void;
        unInput(listener: (event: Event) => void): void;
        onDirtyChanged(listener: (dirty: boolean) => void): void;
        unDirtyChanged(listener: (dirty: boolean) => void): void;
        private notifyDirtyChanged(dirty);
        onValueChanged(listener: (event: api.ValueChangedEvent) => void): void;
        unValueChanged(listener: (event: api.ValueChangedEvent) => void): void;
        private notifyValueChanged(event);
    }
}
declare module api.dom {
    class CompositeFormInputEl extends api.dom.FormInputEl {
        private wrappedInput;
        private additionalElements;
        constructor(input?: api.dom.FormInputEl);
        setAdditionalElements(...additionalElements: api.dom.Element[]): void;
        setWrappedInput(wrappedInput: api.dom.FormInputEl): void;
        doGetValue(): string;
        doSetValue(value: string, silent?: boolean): CompositeFormInputEl;
        setValue(value: string, silent?: boolean, userInput?: boolean): CompositeFormInputEl;
        getValue(): string;
        getName(): string;
        setName(name: string): CompositeFormInputEl;
        isDirty(): boolean;
        resetBaseValues(): void;
        onDirtyChanged(listener: (dirty: boolean) => void): void;
        unDirtyChanged(listener: (dirty: boolean) => void): void;
        onValueChanged(listener: (p1: api.ValueChangedEvent) => void): void;
        unValueChanged(listener: (p1: api.ValueChangedEvent) => void): void;
        onChange(listener: (event: Event) => void): void;
        unChange(listener: (event: Event) => void): void;
        onInput(listener: (event: Event) => void): void;
        unInput(listener: (event: Event) => void): void;
        giveFocus(): boolean;
        giveBlur(): boolean;
        addAdditionalElement(element: api.dom.Element): void;
    }
}
declare module api.dom {
    class InputEl extends FormInputEl {
        constructor(className?: string, type?: string, prefix?: string, originalValue?: string);
        protected handleInput(): void;
        getName(): string;
        setName(value: string): InputEl;
        getType(): string;
        setType(type: string): InputEl;
        setPlaceholder(value: string): InputEl;
        getPlaceholder(): string;
        getPattern(): string;
        setPattern(pattern: string): InputEl;
        reset(): void;
        /**
         * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms_in_HTML
         * @returns {boolean}
         */
        isValid(): boolean;
        /**
         * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms_in_HTML
         * @returns {boolean}
         */
        validate(): boolean;
        setRequired(required: boolean): InputEl;
        isRequired(): boolean;
        setReadOnly(readOnly: boolean): void;
    }
}
declare module api.dom {
    class LabelEl extends Element {
        constructor(value: string, forElement?: Element, className?: string);
        setValue(value: string): void;
        getValue(): string;
    }
}
declare module api.dom {
    class SelectEl extends FormInputEl {
        constructor(className?: string);
    }
}
declare module api.dom {
    class OptionEl extends Element {
        constructor(value?: string, displayName?: string);
    }
}
declare module api.dom {
    class IFrameEl extends api.dom.Element {
        private loaded;
        constructor(className?: string);
        setSrc(src: string): api.dom.IFrameEl;
        private getFrameWindowObject();
        isLoaded(): boolean;
        postMessage(data: any, targetOrigin?: string): void;
        onLoaded(listener: (event: UIEvent) => void): void;
        unLoaded(listener: (event: UIEvent) => void): void;
    }
}
declare module api.dom {
    class FieldsetEl extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class LegendEl extends Element {
        constructor(legend: string, className?: string);
    }
}
declare module api.dom {
    class FormEl extends Element {
        constructor(className?: string);
        preventSubmit(): void;
        onSubmit(listener: (event: Event) => void): void;
        unSubmit(listener: (event: Event) => void): void;
        static getNextFocusable(input: Element, focusableSelector?: string, ignoreTabIndex?: boolean): Element;
        static moveFocusToNextFocusable(input: Element, focusableSelector?: string): void;
        static moveFocusToPrevFocusable(input: Element, focusableSelector?: string): void;
        private static getIndexOfInput(elements, el);
    }
}
declare module api.dom {
    class AsideEl extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class SectionEl extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class ArticleEl extends Element {
        constructor(className?: string, contentEditable?: boolean);
    }
}
declare module api.dom {
    class DlEl extends Element {
        constructor(className?: string);
    }
}
declare module api.dom {
    class DdDtEl extends Element {
        constructor(tag: string, className?: string);
    }
}
declare module api.dom {
    class LinkEl extends api.dom.Element {
        constructor(href: string, rel?: string, className?: string);
        private setHref(href);
        private setRel(rel);
        setAsync(): api.dom.LinkEl;
        onLoaded(listener: (event: UIEvent) => void): void;
        unLoaded(listener: (event: UIEvent) => void): void;
    }
}
declare module api.notify {
    enum Type {
        INFO = 0,
        ERROR = 1,
        WARNING = 2,
        ACTION = 3,
        SUCCESS = 4,
    }
    class Action {
        private name;
        private handler;
        constructor(name: string, handler: {
            (): void;
        });
        getName(): string;
        getHandler(): {
            (): void;
        };
    }
    class Message {
        private type;
        private text;
        private actions;
        private autoHide;
        constructor(type: Type, text: string, autoHide?: boolean);
        getType(): Type;
        getText(): string;
        getActions(): Action[];
        getAutoHide(): boolean;
        addAction(name: string, handler: () => void): void;
        static newSuccess(text: string, autoHide?: boolean): Message;
        static newInfo(text: string, autoHide?: boolean): Message;
        static newError(text: string, autoHide?: boolean): Message;
        static newWarning(text: string, autoHide?: boolean): Message;
        static newAction(text: string, autoHide?: boolean): Message;
    }
}
declare module api.notify {
    function showSuccess(message: string, autoHide?: boolean): void;
    function showFeedback(message: string, autoHide?: boolean): void;
    function showError(message: string, autoHide?: boolean): void;
    function showWarning(message: string, autoHide?: boolean): void;
}
declare module api.notify {
    class NotifyOpts {
        message: string;
        type: string;
        listeners: {
            (): void;
        }[];
        autoHide: boolean;
        addListeners(message: Message): void;
        createHtmlMessage(message: Message): void;
        static buildOpts(message: Message): NotifyOpts;
    }
}
declare module api.notify {
    class NotifyManager {
        private static instance;
        private notificationLimit;
        private queue;
        private lifetime;
        private slideDuration;
        private timers;
        private el;
        private registry;
        constructor();
        showFeedback(message: string, autoHide?: boolean): void;
        showSuccess(message: string, autoHide?: boolean): void;
        showError(message: string, autoHide?: boolean): void;
        showWarning(message: string, autoHide?: boolean): void;
        notify(message: Message): void;
        private createNotification(opts);
        private renderNotification(notification);
        hide(messageId: string): void;
        private setListeners(el, opts);
        private handleNotificationRemoved();
        private remove(el);
        private startTimer(el);
        private stopTimer(el);
        static get(): NotifyManager;
        private static getFromParentIFrame();
    }
}
declare module api.notify {
    class NotificationMessage extends api.dom.DivEl {
        private notificationInner;
        private autoHide;
        constructor(message: string, autoHide?: boolean);
        isAutoHide(): boolean;
    }
}
declare module api.notify {
    class NotificationContainer extends api.dom.DivEl {
        private wrapper;
        constructor();
        getWrapper(): api.dom.DivEl;
    }
}
declare module api.rest {
    class Path {
        private static DEFAULT_ELEMENT_DIVIDER;
        private elementDivider;
        private absolute;
        private elements;
        private refString;
        static fromString(s: string, elementDivider?: string): Path;
        static fromParent(parent: Path, ...childElements: string[]): Path;
        private static removeEmptyElements(elements);
        constructor(elements: string[], elementDivider?: string, absolute?: boolean);
        getElements(): string[];
        getElement(index: number): string;
        hasParent(): boolean;
        getParentPath(): Path;
        toString(): string;
        isAbsolute(): boolean;
    }
}
declare module api.rest {
    class JsonRequest<RAW_JSON_TYPE> {
        private path;
        private method;
        private params;
        private timeoutMillis;
        setPath(value: Path): JsonRequest<RAW_JSON_TYPE>;
        setMethod(value: string): JsonRequest<RAW_JSON_TYPE>;
        setParams(params: Object): JsonRequest<RAW_JSON_TYPE>;
        setTimeout(timeoutMillis: number): JsonRequest<RAW_JSON_TYPE>;
        send(): wemQ.Promise<JsonResponse<RAW_JSON_TYPE>>;
        private prepareGETRequest(request);
        private preparePOSTRequest(request);
    }
}
declare module api.rest {
    class Response {
    }
}
declare module api.rest {
    class JsonResponse<RAW_JSON_TYPE> extends api.rest.Response {
        private json;
        constructor(json: any);
        isBlank(): boolean;
        getJson(): any;
        hasResult(): boolean;
        getResult(): RAW_JSON_TYPE;
    }
}
declare module api.rest {
    class StatusCode {
        static NOT_FOUND: number;
    }
}
declare module api.rest {
    class RequestError extends api.Exception {
        private statusCode;
        constructor(statusCode: number, errorMsg: string);
        getStatusCode(): number;
        isNotFound(): boolean;
    }
}
declare module api.rest {
    class ResourceRequest<RAW_JSON_TYPE, PARSED_TYPE> {
        private restPath;
        private method;
        private heavyOperation;
        private timeoutMillis;
        constructor();
        setMethod(value: string): void;
        getRestPath(): Path;
        getRequestPath(): Path;
        getParams(): Object;
        setTimeout(timeoutMillis: number): void;
        setHeavyOperation(value: boolean): void;
        validate(): void;
        send(): wemQ.Promise<JsonResponse<RAW_JSON_TYPE>>;
        sendAndParse(): wemQ.Promise<PARSED_TYPE>;
    }
}
declare module api.rest {
    enum Expand {
        NONE = 0,
        SUMMARY = 1,
        FULL = 2,
    }
}
/**
 * This module holds classes for the property domain.
 *
 * Properties are organized in a tree like structure named [[PropertyTree]].
 *
 * The [[PropertyTree]] has a root [[PropertySet]] which contains a set of properties [[Property]].
 */
declare module api.data {
}
declare module api.data {
    class ValueType implements api.Equitable {
        private name;
        constructor(name: string);
        toString(): string;
        valueToString(value: Value): string;
        valueToBoolean(value: Value): boolean;
        valueToNumber(value: Value): number;
        isValid(value: any): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        newNullValue(): Value;
        equals(o: api.Equitable): boolean;
        valueEquals(a: any, b: any): boolean;
        /**
         * Returns the actual object backing this Value.
         * If the REST service or JSON would not understand this value, then override and return compatible value.
         */
        toJsonValue(value: Value): any;
        fromJsonValue(jsonValue: any): Value;
    }
}
declare module api.data {
    class ValueTypePropertySet extends ValueType {
        constructor();
        isValid(value: any): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        toJsonValue(value: Value): any;
        fromJsonValue(propertyArrayJsonArray: PropertyArrayJson[]): Value;
        valueToString(value: Value): string;
        valueEquals(a: PropertySet, b: PropertySet): boolean;
    }
}
declare module api.data {
    class ValueTypeString extends ValueType {
        constructor();
        isValid(value: any): boolean;
        valueEquals(a: string, b: string): boolean;
        newValue(value: string): Value;
        toJsonValue(value: Value): any;
    }
}
declare module api.data {
    class ValueTypeXml extends ValueType {
        constructor();
        isValid(value: any): boolean;
        valueEquals(a: string, b: string): boolean;
        newValue(value: string): Value;
        toJsonValue(value: Value): any;
    }
}
declare module api.data {
    class ValueTypeBoolean extends ValueType {
        constructor();
        isValid(value: any): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        fromJsonValue(jsonValue: boolean): Value;
        private convertFromString(value);
        valueToString(value: Value): string;
        valueEquals(a: boolean, b: boolean): boolean;
        newBoolean(value: boolean): Value;
    }
}
declare module api.data {
    class ValueTypeLong extends ValueType {
        constructor();
        isValid(value: any): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        fromJsonValue(jsonValue: number): Value;
        private convertFromString(value);
        valueToString(value: Value): string;
        valueEquals(a: number, b: number): boolean;
    }
}
declare module api.data {
    class ValueTypeDouble extends ValueType {
        constructor();
        isValid(value: any): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        fromJsonValue(jsonValue: number): Value;
        private convertFromString(value);
        valueToString(value: Value): string;
        valueEquals(a: number, b: number): boolean;
    }
}
declare module api.data {
    import LocalDate = api.util.LocalDate;
    class ValueTypeLocalDate extends ValueType {
        constructor();
        isValid(value: any): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        toJsonValue(value: Value): string;
        valueToString(value: Value): string;
        valueEquals(a: LocalDate, b: LocalDate): boolean;
    }
}
declare module api.data {
    import LocalDateTime = api.util.LocalDateTime;
    class ValueTypeLocalDateTime extends ValueType {
        constructor();
        isValid(value: string): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        toJsonValue(value: Value): string;
        valueToString(value: Value): string;
        valueEquals(a: LocalDateTime, b: LocalDateTime): boolean;
    }
}
declare module api.data {
    class ValueTypeLocalTime extends ValueType {
        constructor();
        isValid(value: any): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        valueToString(value: Value): string;
        valueEquals(a: api.util.LocalTime, b: api.util.LocalTime): boolean;
        toJsonValue(value: Value): string;
    }
}
declare module api.data {
    import DateTime = api.util.DateTime;
    class ValueTypeDateTime extends ValueType {
        constructor();
        isValid(value: any): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        toJsonValue(value: Value): string;
        valueToString(value: Value): string;
        valueEquals(a: DateTime, b: DateTime): boolean;
    }
}
declare module api.data {
    class ValueTypeGeoPoint extends ValueType {
        constructor();
        isValid(value: any): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        valueToString(value: Value): string;
        toJsonValue(value: Value): any;
        valueEquals(a: api.util.GeoPoint, b: api.util.GeoPoint): boolean;
    }
}
declare module api.data {
    class ValueTypeBinaryReference extends ValueType {
        constructor();
        isValid(value: any): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        valueToString(value: Value): string;
        toJsonValue(value: Value): any;
        valueEquals(a: api.util.BinaryReference, b: api.util.BinaryReference): boolean;
    }
}
declare module api.data {
    class ValueTypeReference extends ValueType {
        constructor();
        isValid(value: any): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        valueToString(value: Value): string;
        toJsonValue(value: Value): any;
        valueEquals(a: api.util.Reference, b: api.util.Reference): boolean;
    }
}
declare module api.data {
    class ValueTypeLink extends ValueType {
        constructor();
        isValid(value: any): boolean;
        isConvertible(value: string): boolean;
        newValue(value: string): Value;
        valueToString(value: Value): string;
        toJsonValue(value: Value): any;
        valueEquals(a: api.util.Link, b: api.util.Link): boolean;
    }
}
declare module api.data {
    class ValueTypes {
        static DATA: ValueTypePropertySet;
        static STRING: ValueTypeString;
        static XML: ValueTypeXml;
        static LOCAL_DATE: ValueTypeLocalDate;
        static LOCAL_TIME: ValueTypeLocalTime;
        static LOCAL_DATE_TIME: ValueTypeLocalDateTime;
        static DATE_TIME: ValueTypeDateTime;
        static LONG: ValueTypeLong;
        static BOOLEAN: ValueTypeBoolean;
        static DOUBLE: ValueTypeDouble;
        static GEO_POINT: ValueTypeGeoPoint;
        static REFERENCE: ValueTypeReference;
        static BINARY_REFERENCE: ValueTypeBinaryReference;
        static ALL: ValueType[];
        static fromName(name: string): ValueType;
    }
}
declare module api.data {
    class Value implements api.Equitable, api.Cloneable {
        private type;
        private value;
        constructor(value: Object, type: ValueType);
        getType(): ValueType;
        isNotNull(): boolean;
        isNull(): boolean;
        getObject(): Object;
        getString(): string;
        isPropertySet(): boolean;
        getPropertySet(): PropertySet;
        getBoolean(): boolean;
        getLong(): number;
        getDouble(): number;
        getDateTime(): api.util.DateTime;
        getLocalDate(): api.util.LocalDate;
        getLocalDateTime(): api.util.LocalDateTime;
        getLocalTime(): api.util.LocalTime;
        getGeoPoint(): api.util.GeoPoint;
        getBinaryReference(): api.util.BinaryReference;
        getReference(): api.util.Reference;
        getLink(): api.util.Link;
        equals(o: api.Equitable): boolean;
        clone(): Value;
    }
}
declare module api.data {
    class ValueTypeConverter {
        private static VALID_REFERENCE_ID_PATTERN;
        static convertTo(value: Value, toType: ValueType): Value;
        private static convertToString(value);
        private static convertToBoolean(value);
        private static convertToLong(value);
        private static convertToDouble(value);
        private static convertToGeoPoint(value);
        private static convertToReference(value);
        private static convertToBinaryReference(value);
        private static convertToXml(value);
        private static convertToData(value);
        private static convertToLocalDate(value);
        private static convertToLocalDateTime(value);
        private static convertToDateTime(value);
        private static convertToLocalTime(value);
    }
}
declare module api.data {
    class PropertyPath implements api.Equitable {
        private static ELEMENT_DIVIDER;
        static ROOT: PropertyPath;
        private absolute;
        private elements;
        private refString;
        static fromString(s: string): PropertyPath;
        static fromParent(parent: PropertyPath, ...childElements: PropertyPathElement[]): PropertyPath;
        static fromPathElement(element: PropertyPathElement): PropertyPath;
        constructor(elements: PropertyPathElement[], absolute?: boolean);
        removeFirstPathElement(): PropertyPath;
        elementCount(): number;
        getElements(): PropertyPathElement[];
        getElement(index: number): PropertyPathElement;
        getFirstElement(): PropertyPathElement;
        getLastElement(): PropertyPathElement;
        hasParent(): boolean;
        getParentPath(): PropertyPath;
        toString(): string;
        isAbsolute(): boolean;
        asRelative(): PropertyPath;
        isRoot(): boolean;
        equals(o: Equitable): boolean;
    }
    class PropertyPathElement {
        private name;
        private index;
        constructor(name: string, index: number);
        getName(): string;
        getIndex(): number;
        toString(): string;
        static fromString(str: string): PropertyPathElement;
    }
}
declare module api.data {
    class PropertyEvent {
        private type;
        private property;
        constructor(type: PropertyEventType, property: Property);
        getType(): PropertyEventType;
        getProperty(): Property;
        getPath(): PropertyPath;
        toString(): string;
    }
}
declare module api.data {
    class PropertyIndexChangedEvent extends PropertyEvent {
        private previousIndex;
        private newIndex;
        constructor(property: Property, previousIndex: number, newIndex: number);
        getPreviousIndex(): number;
        getNewIndex(): number;
        toString(): string;
    }
}
declare module api.data {
    class PropertyValueChangedEvent extends PropertyEvent {
        private previousValue;
        private newValue;
        constructor(property: Property, previousValue: Value, newValue: Value);
        getPreviousValue(): Value;
        getNewValue(): Value;
        toString(): string;
    }
}
declare module api.data {
    enum PropertyEventType {
        ADDED = 0,
        INDEX_CHANGED = 1,
        VALUE_CHANGED = 2,
        REMOVED = 3,
    }
}
declare module api.data {
    class PropertyAddedEvent extends PropertyEvent {
        constructor(property: Property);
        toString(): string;
    }
}
declare module api.data {
    class PropertyRemovedEvent extends PropertyEvent {
        constructor(property: Property);
        toString(): string;
    }
}
declare module api.data {
    import BinaryReference = api.util.BinaryReference;
    import Reference = api.util.Reference;
    import GeoPoint = api.util.GeoPoint;
    import LocalTime = api.util.LocalTime;
    import DateTime = api.util.DateTime;
    import LocalDateTime = api.util.LocalDateTime;
    import LocalDate = api.util.LocalDate;
    /**
     * A Property has a [[name]] and a [[value]],
     * but also:
     * *  an [[index]], since it's a part of an [[array]]
     * *  a [[parent]], since it's also a part of a [[PropertySet]]
     *
     * A Property is mutable, both it's [[index]] and [[value]] can change.
     */
    class Property implements api.Equitable {
        static debug: boolean;
        private parent;
        private array;
        private name;
        private index;
        private value;
        private propertyIndexChangedListeners;
        private propertyValueChangedListeners;
        constructor(builder: PropertyBuilder);
        /**
         * Change the index.
         *
         * A [[PropertyIndexChangedEvent]] will be notified to listeners if the index really changed.
         * @param newIndex
         */
        setIndex(newIndex: number): void;
        /**
         * Change the value.
         *
         * A [[PropertyValueChangedEvent]] will be notified to listeners if the value really changed.
         * @param value
         */
        setValue(value: Value): void;
        convertValueType(type: ValueType): void;
        /**
         * Detach this Property from it's array and parent. Should be called when removed from the array.
         */
        detach(): void;
        reset(): void;
        getParent(): PropertySet;
        hasParentProperty(): boolean;
        getParentProperty(): Property;
        getPath(): PropertyPath;
        getName(): string;
        getIndex(): number;
        getType(): ValueType;
        getValue(): Value;
        hasNullValue(): boolean;
        hasNonNullValue(): boolean;
        getPropertySet(): PropertySet;
        getString(): string;
        getLong(): number;
        getDouble(): number;
        getBoolean(): boolean;
        getDateTime(): DateTime;
        getLocalDate(): LocalDate;
        getLocalDateTime(): LocalDateTime;
        getLocalTime(): LocalTime;
        getGeoPoint(): GeoPoint;
        getReference(): Reference;
        getBinaryReference(): BinaryReference;
        equals(o: api.Equitable): boolean;
        copy(destinationPropertyArray: PropertyArray): Property;
        onPropertyIndexChanged(listener: {
            (event: PropertyIndexChangedEvent): void;
        }): void;
        unPropertyIndexChanged(listener: {
            (event: PropertyIndexChangedEvent): void;
        }): void;
        private notifyPropertyIndexChangedEvent(previousIndex, newIndex);
        onPropertyValueChanged(listener: {
            (event: PropertyValueChangedEvent): void;
        }): void;
        unPropertyValueChanged(listener: {
            (event: PropertyValueChangedEvent): void;
        }): void;
        private notifyPropertyValueChangedEvent(previousValue, newValue);
        static checkName(name: string): void;
        static create(): PropertyBuilder;
    }
    class PropertyBuilder {
        array: PropertyArray;
        name: string;
        index: number;
        value: Value;
        setArray(value: PropertyArray): PropertyBuilder;
        setName(value: string): PropertyBuilder;
        setIndex(value: number): PropertyBuilder;
        setValue(value: Value): PropertyBuilder;
        build(): Property;
    }
}
declare module api.data {
    class PropertyVisitor {
        private valueType;
        restrictType(value: ValueType): PropertyVisitor;
        traverse(propertySet: PropertySet): void;
        visit(property: Property): void;
    }
}
declare module api.data {
    class PropertyTreeComparator {
        compareTree(treeA: PropertyTree, treeB: PropertyTree): void;
        compareSet(setA: PropertySet, setB: PropertySet): void;
    }
}
declare module api.data {
    interface PropertyValueJson {
        v?: any;
        set?: PropertyArrayJson[];
    }
}
declare module api.data {
    interface PropertyArrayJson {
        name: string;
        type: string;
        values: PropertyValueJson[];
    }
}
declare module api.data {
    /**
     * A PropertyArray manages an array of properties having the same: [[parent]], [[type]] and [[name]].
     * @see [[Property]]
     */
    class PropertyArray implements api.Equitable {
        static debug: boolean;
        private tree;
        private parent;
        private name;
        private type;
        private array;
        private propertyAddedListeners;
        private propertyRemovedListeners;
        private propertyIndexChangedListeners;
        private propertyValueChangedListeners;
        private propertyAddedEventHandler;
        private propertyRemovedEventHandler;
        private propertyIndexChangedEventHandler;
        private propertyValueChangedEventHandler;
        constructor(builder: PropertyArrayBuilder);
        forEach(callBack: {
            (property: Property, index: number): void;
        }): void;
        containsValue(value: Value): boolean;
        getTree(): PropertyTree;
        getParent(): PropertySet;
        getParentPropertyPath(): PropertyPath;
        getName(): string;
        getType(): ValueType;
        convertValues(newType: ValueType): void;
        private checkType(type);
        private checkIndex(index);
        newSet(): PropertySet;
        /**
         * Application protected. Not to be used outside module.
         */
        addProperty(property: Property): void;
        add(value: Value): Property;
        addSet(): PropertySet;
        set(index: number, value: Value): Property;
        move(index: number, destinationIndex: number): void;
        remove(index: number): void;
        exists(index: number): boolean;
        get(index: number): Property;
        getValue(index: number): Value;
        getSet(index: number): PropertySet;
        getSize(): number;
        isEmpty(): boolean;
        /**
         * Returns a copy of the array of properties.
         */
        getProperties(): Property[];
        equals(o: Equitable): boolean;
        copy(destinationPropertySet: PropertySet): PropertyArray;
        private registerPropertyListeners(property);
        private unregisterPropertyListeners(property);
        /**
         * Application protected. Not to be used outside module.
         */
        registerPropertySetListeners(propertySet: PropertySet): void;
        /**
         * Application protected. Not to be used outside module.
         */
        unregisterPropertySetListeners(propertySet: PropertySet): void;
        onPropertyAdded(listener: {
            (event: PropertyAddedEvent): void;
        }): void;
        unPropertyAdded(listener: {
            (event: PropertyAddedEvent): void;
        }): void;
        private notifyPropertyAdded(property);
        private forwardPropertyAddedEvent(event);
        onPropertyRemoved(listener: {
            (event: PropertyRemovedEvent): void;
        }): void;
        unPropertyRemoved(listener: {
            (event: PropertyRemovedEvent): void;
        }): void;
        private notifyPropertyRemoved(property);
        private forwardPropertyRemovedEvent(event);
        onPropertyIndexChanged(listener: {
            (event: PropertyIndexChangedEvent): void;
        }): void;
        unPropertyIndexChanged(listener: {
            (event: PropertyIndexChangedEvent): void;
        }): void;
        private forwardPropertyIndexChangedEvent(event);
        onPropertyValueChanged(listener: {
            (event: PropertyValueChangedEvent): void;
        }): void;
        unPropertyValueChanged(listener: {
            (event: PropertyValueChangedEvent): void;
        }): void;
        private forwardPropertyValueChangedEvent(event);
        static create(): PropertyArrayBuilder;
        toJson(): PropertyArrayJson;
        private idForDebug();
        static fromJson(json: PropertyArrayJson, parentPropertySet: PropertySet, tree: PropertyTree): PropertyArray;
    }
    class PropertyArrayBuilder {
        parent: PropertySet;
        name: string;
        type: ValueType;
        setParent(value: PropertySet): PropertyArrayBuilder;
        setName(value: string): PropertyArrayBuilder;
        setType(value: ValueType): PropertyArrayBuilder;
        build(): PropertyArray;
    }
}
declare module api.data {
    import Reference = api.util.Reference;
    import BinaryReference = api.util.BinaryReference;
    import GeoPoint = api.util.GeoPoint;
    import LocalTime = api.util.LocalTime;
    /**
     * A PropertySet manages a set of properties. The properties are grouped in arrays by name ([[Property.name]]).
     *
     * The PropertySet provides several functions for both creation, updating and getting property values of a certain type (see [[ValueTypes]]).
     * Instead of repeating the documentation for each type, here is an overview of the functions which exists for each [[ValueType]]
     * (replace Xxx with one of the value types).
     *
     * * addXxx(name, value) : Property
     * > Creates a new property with the given name and value, and adds it to this PropertySet.
     * Returns the added property.
     *
     * * addXxxs(name: string, values:Xxx[]) : Property[]
     * > Creates new properties with the given name and values, and adds them to this PropertySet.
     * Returns an array of the added properties.
     *
     * * setXxx(name: string, value: Xxx, index: number) : Property
     * > On the root PropertySet: In this PropertySet; creates a new property with given name, index and value or updates existing with given value.
     * Returns the created or updated property.
     *
     * * setXxxByPath(path: any, value: Xxx) : Property
     * > Creates a new property at given path (relative to this PropertySet) with given value or updates existing with given value. path can either be a string or [[PropertyPath]].
     * Returns the created or updated property.
     *
     * * getXxx(identifier: string, index: number): Xxx
     * > Gets a property value of type Xxx with given identifier and optional index. If index is given, then the identifier is understood
     *  as the name of the property and it will be retrieved from this PropertySet. If the index is omitted the identifier is understood
     *  as a relative path (to this PropertySet) of the property.
     *
     * * getXxxs(name: string): Xxx[]
     * > Gets property values of type Xxx with the given name. Returns an array of type Xxx.
     *
     *
     * @see [[PropertyArray]]
     * @see [[Property]]
     */
    class PropertySet implements api.Equitable {
        static debug: boolean;
        private tree;
        /**
         * The property that this PropertySet is the value of.
         * Required to be set, except for the root PropertySet of a PropertyTree where it will always be null.
         */
        private property;
        private propertyArrayByName;
        /**
         * If true, do not add property if it's value is null.
         */
        private skipNulls;
        private changedListeners;
        private propertyAddedListeners;
        private propertyRemovedListeners;
        private propertyIndexChangedListeners;
        private propertyValueChangedListeners;
        private propertyAddedEventHandler;
        private propertyRemovedEventHandler;
        private propertyIndexChangedEventHandler;
        private propertyValueChangedEventHandler;
        constructor(tree?: PropertyTree);
        /**
         * Application protected. Not to be used outside module.
         */
        setContainerProperty(value: Property): void;
        /**
         * Whether this PropertySet is attached to a [[PropertyTree]] or not.
         * @returns {boolean} true if it's not attached to a [[PropertyTree]].
         */
        isDetached(): boolean;
        getTree(): PropertyTree;
        /**
         * Application protected. Not to be used outside module.
         */
        attachToTree(tree: PropertyTree): void;
        addPropertyArray(array: PropertyArray): void;
        addProperty(name: string, value: Value): Property;
        setPropertyByPath(path: any, value: Value): Property;
        private doSetProperty(path, value);
        private getOrCreateSet(name, index);
        setProperty(name: string, index: number, value: Value): Property;
        private getOrCreatePropertyArray(name, type);
        removeProperties(properties: Property[]): void;
        removeProperty(name: string, index: number): void;
        isEmpty(): boolean;
        removeEmptyValues(): void;
        private doRemoveEmptyValues(propertySet);
        private removeEmptyArrays(propertySet);
        /**
         * Returns the number of child properties in this PropertySet (grand children and so on is not counted).
         */
        getSize(): number;
        /**
         * Counts the number of child properties having the given name (grand children and so on is not counted).
         */
        countProperties(name: string): number;
        /**
         * @returns {PropertyPath} The [[PropertyPath]] that this PropertySet is a value of.
         */
        getPropertyPath(): PropertyPath;
        /**
         * * getProperty() - If no arguments are given then this PropertySet's Property is returned.
         * * getProperty(name: string, index: number) - If name and index are given then property with that name and index is returned.
         * * getProperty(path: string) - If a path as string is given then property with that path is returned.
         * * getProperty(path: PropertyPath ) - If a path as [[PropertyPath]] is given then property with that path is returned.
         *
         * @param identifier
         * @param index
         * @returns {Property}
         */
        getProperty(identifier?: any, index?: number): Property;
        private getPropertyByPath(path);
        private doGetPropertyByPath(path);
        getPropertyArray(name: string): PropertyArray;
        /**
         * Calls the given callback for each property in the set.
         */
        forEach(callback: (property: Property, index?: number) => void): void;
        reset(): void;
        /**
         * Calls the given callback for each property with the given name.
         */
        forEachProperty(propertyName: string, callback: (property: Property, index?: number) => void): void;
        isNotNull(identifier: any, index?: number): boolean;
        isNull(identifier: any, index?: number): boolean;
        equals(o: Equitable): boolean;
        diff(other: PropertySet): PropertyTreeDiff;
        private doDiff(other, checkedProperties?);
        /**
         * Copies this PropertySet (deep copy).
         * @param destinationTree The [[PropertyTree]] that the copied PropertySet will be attached to.
         * @returns {api.data.PropertySet}
         */
        copy(destinationTree: PropertyTree): PropertySet;
        toJson(): PropertyArrayJson[];
        private registerPropertyArrayListeners(array);
        private unregisterPropertyArrayListeners(array);
        onChanged(listener: {
            (event: PropertyEvent): void;
        }): void;
        unChanged(listener: {
            (event: PropertyEvent): void;
        }): void;
        private notifyChangedListeners(event);
        /**
         * Register a listener-function to be called when a [[Property]] has been added to this PropertySet or any below.
         * @param listener
         * @see [[PropertyAddedEvent]]
         */
        onPropertyAdded(listener: {
            (event: PropertyAddedEvent): void;
        }): void;
        /**
         * Deregister a listener-function.
         * @param listener
         * @see [[PropertyAddedEvent]]
         */
        unPropertyAdded(listener: {
            (event: PropertyAddedEvent): void;
        }): void;
        private forwardPropertyAddedEvent(event);
        /**
         * Register a listener-function to be called when a [[Property]] has been removed from this PropertySet or any below.
         * @param listener
         * @see [[PropertyRemovedEvent]]
         */
        onPropertyRemoved(listener: {
            (event: PropertyRemovedEvent): void;
        }): void;
        /**
         * Deregister a listener-function.
         * @param listener
         * @see [[PropertyRemovedEvent]]
         */
        unPropertyRemoved(listener: {
            (event: PropertyRemovedEvent): void;
        }): void;
        private forwardPropertyRemovedEvent(event);
        /**
         * Register a listener-function to be called when the [[Property.index]] in this this PropertySet or any below has changed.
         * @param listener
         * @see [[PropertyRemovedEvent]]
         */
        onPropertyIndexChanged(listener: {
            (event: PropertyIndexChangedEvent): void;
        }): void;
        /**
         * Deregister a listener-function.
         * @param listener
         * @see [[PropertyIndexChangedEvent]]
         */
        unPropertyIndexChanged(listener: {
            (event: PropertyIndexChangedEvent): void;
        }): void;
        private forwardPropertyIndexChangedEvent(event);
        /**
         * Register a listener-function to be called when the [[Property.value]] in this this PropertySet or any below has changed.
         * @param listener
         * @see [[PropertyValueChangedEvent]]
         */
        onPropertyValueChanged(listener: {
            (event: PropertyValueChangedEvent): void;
        }): void;
        /**
         * Deregister a listener-function.
         * @param listener
         * @see [[PropertyValueChangedEvent]]
         */
        unPropertyValueChanged(listener: {
            (event: PropertyValueChangedEvent): void;
        }): void;
        private forwardPropertyValueChangedEvent(event);
        /**
         * Creates a new PropertySet attached to the same [[PropertyTree]] as this PropertySet.
         * The PropertySet is not added to the tree.
         * @returns {PropertySet}
         */
        newSet(): PropertySet;
        /**
         * Creates
         * @param name
         * @param value optional
         * @returns {PropertySet}
         */
        addPropertySet(name: string, value?: PropertySet): PropertySet;
        setPropertySet(name: string, index: number, value: PropertySet): Property;
        setPropertySetByPath(path: any, value: PropertySet): Property;
        getPropertySet(identifier: any, index?: number): PropertySet;
        getPropertySets(name: string): PropertySet[];
        addString(name: string, value: string): Property;
        addStrings(name: string, values: string[]): Property[];
        setString(name: string, index: number, value: string): Property;
        setStringByPath(path: any, value: string): Property;
        getString(identifier: string, index?: number): string;
        getStrings(name: string): string[];
        addLong(name: string, value: number): Property;
        addLongs(name: string, values: number[]): Property[];
        setLong(name: string, index: number, value: number): Property;
        setLongByPath(path: any, value: number): Property;
        getLong(identifier: string, index?: number): number;
        getLongs(name: string): number[];
        addDouble(name: string, value: number): Property;
        addDoubles(name: string, values: number[]): Property[];
        setDouble(name: string, index: number, value: number): Property;
        setDoubleByPath(path: any, value: number): Property;
        getDouble(identifier: string, index?: number): number;
        getDoubles(name: string): number[];
        addBoolean(name: string, value: boolean): Property;
        addBooleans(name: string, values: boolean[]): Property[];
        setBoolean(name: string, index: number, value: boolean): Property;
        setBooleanByPath(path: any, value: boolean): Property;
        getBoolean(identifier: string, index?: number): boolean;
        getBooleans(name: string): boolean[];
        addReference(name: string, value: Reference): Property;
        addReferences(name: string, values: Reference[]): Property[];
        setReference(name: string, index: number, value: Reference): Property;
        setReferenceByPath(path: any, value: Reference): Property;
        getReference(identifier: string, index?: number): Reference;
        getReferences(name: string): Reference[];
        addBinaryReference(name: string, value: BinaryReference): Property;
        addBinaryReferences(name: string, values: BinaryReference[]): Property[];
        setBinaryReference(name: string, index: number, value: BinaryReference): Property;
        setBinaryReferenceByPath(path: any, value: BinaryReference): Property;
        getBinaryReference(identifier: string, index?: number): BinaryReference;
        getBinaryReferences(name: string): BinaryReference[];
        addGeoPoint(name: string, value: GeoPoint): Property;
        addGeoPoints(name: string, values: GeoPoint[]): Property[];
        setGeoPoint(name: string, index: number, value: GeoPoint): Property;
        setGeoPointByPath(path: any, value: GeoPoint): Property;
        getGeoPoint(identifier: string, index?: number): GeoPoint;
        getGeoPoints(name: string): GeoPoint[];
        addLocalDate(name: string, value: api.util.LocalDate): Property;
        addLocalDates(name: string, values: api.util.LocalDate[]): Property[];
        setLocalDate(name: string, index: number, value: api.util.LocalDate): Property;
        setLocalDateByPath(path: any, value: api.util.LocalDate): Property;
        getLocalDate(identifier: string, index?: number): api.util.LocalDate;
        getLocalDates(name: string): api.util.LocalDate[];
        addLocalDateTime(name: string, value: api.util.LocalDateTime): Property;
        addLocalDateTimes(name: string, values: api.util.LocalDateTime[]): Property[];
        setLocalDateTime(name: string, index: number, value: api.util.LocalDateTime): Property;
        setLocalDateTimeByPath(path: any, value: api.util.LocalDateTime): Property;
        getLocalDateTime(identifier: string, index?: number): api.util.LocalDateTime;
        getLocalDateTimes(name: string): api.util.LocalDateTime[];
        addLocalTime(name: string, value: LocalTime): Property;
        addLocalTimes(name: string, values: LocalTime[]): Property[];
        setLocalTime(name: string, index: number, value: LocalTime): Property;
        setLocalTimeByPath(path: any, value: LocalTime): Property;
        getLocalTime(identifier: string, index?: number): LocalTime;
        getLocalTimes(name: string): LocalTime[];
        addDateTime(name: string, value: api.util.DateTime): Property;
        addDateTimes(name: string, values: api.util.DateTime[]): Property[];
        setDateTime(name: string, index: number, value: api.util.DateTime): Property;
        setDateTimeByPath(path: any, value: api.util.DateTime): Property;
        getDateTime(identifier: string, index?: number): api.util.DateTime;
        getDateTimes(name: string): api.util.DateTime[];
    }
}
declare module api.data {
    import Reference = api.util.Reference;
    import BinaryReference = api.util.BinaryReference;
    import GeoPoint = api.util.GeoPoint;
    import LocalTime = api.util.LocalTime;
    interface PropertyTreeDiff {
        added: Property[];
        removed: Property[];
        modified: {
            oldValue: Property;
            newValue: Property;
        }[];
    }
    /**
     * The PropertyTree is the root container of properties.
     *
     * The PropertyTree is mutable and most mutations can be observed by listening to the following events:
     * * [[PropertyAddedEvent]]
     * * [[PropertyRemovedEvent]]
     * * [[PropertyIndexChangedEvent]]
     * * [[PropertyValueChangedEvent]]
     *
     * The PropertyTree provides several functions for both creation, updating and getting property values of a certain type (see [[ValueTypes]]).
     * Instead of repeating the documentation for each type, here is an overview of the functions which exists for each [[ValueType]]
     * (replace Xxx with one of the value types).
     *
     * * addXxx(name, value) : Property
     * > Creates a new property with the given name and value, and adds it to the root PropertySet.
     * Returns the added property.
     *
     * * addXxxs(name: string, values:Xxx[]) : Property[]
     * > Creates new properties with the given name and values, and adds them to the root PropertySet.
     * Returns an array of the added properties.
     *
     * * setXxx(name: string, value: Xxx, index: number) : Property
     * > On the root PropertySet: Creates a new property with given name, index and value or updates existing with given value.
     * Returns the created or updated property.
     *
     * * setXxxByPath(path: any, value: Xxx) : Property
     * > Creates a new property at given path with given value or updates existing with given value. path can either be a string or [[PropertyPath]].
     * Returns the created or updated property.
     *
     * * getXxx(identifier: string, index: number): Xxx
     * > Gets a property value of type Xxx with given identifier and optional index. If index is given, then the identifier is understood
     *  as the name of the property and it will be retrieved from the root PropertySet. If the index is omitted the identifier is understood
     *  as the absolute path of the property.
     *
     * * getXxxs(name: string): Xxx[]
     * > Gets property values of type Xxx with the given name. Returns an array of type Xxx.
     *
     * @see [[Property]]
     * @see [[PropertyArray]]
     * @see [[PropertySet]]
     */
    class PropertyTree implements api.Equitable {
        private root;
        /**
         * * To create a copy of another tree:
         * > give the root [[PropertySet]] of the tree to copy from
         *
         * @param sourceRoot optional. If given this tree will be a copy of the given [[PropertySet]].
         */
        constructor(sourceRoot?: PropertySet);
        /**
         * @returns {PropertySet} Returns the root [[PropertySet]] of this tree.
         */
        getRoot(): PropertySet;
        addProperty(name: string, value: Value): Property;
        setPropertyByPath(path: any, value: Value): Property;
        setProperty(name: string, index: number, value: Value): Property;
        removeProperties(properties: Property[]): void;
        removeProperty(name: string, index: number): void;
        /**
         * * getProperty() - If no arguments are given then this PropertySet's Property is returned.
         * * getProperty(name: string, index: number) - If name and index are given then property with that name and index is returned.
         * * getProperty(path: string) - If a path as string is given then property with that path is returned.
         * * getProperty(path: PropertyPath ) - If a path as [[PropertyPath]] is given then property with that path is returned.
         *
         * @see [[PropertySet.getProperty]]
         * @param identifier
         * @param index
         * @returns {Property}
         */
        getProperty(identifier?: any, index?: number): Property;
        getPropertyArray(name: string): PropertyArray;
        forEachProperty(name: string, callback: (property: Property, index?: number) => void): void;
        /**
         * @param o
         * @returns {boolean} true if given [[api.Equitable]] equals this tree.
         */
        equals(o: api.Equitable): boolean;
        removeEmptyValues(): void;
        diff(other: PropertyTree): PropertyTreeDiff;
        /**
         * Copies this tree (deep copy).
         * @see [[PropertySet.copy]]
         * @returns {api.data.PropertyTree}
         */
        copy(): PropertyTree;
        toJson(): PropertyArrayJson[];
        /**
         * Register a listener-function to be called when any [[PropertyEvent]] has been fired anywhere in the tree.
         * @param listener
         * @see [[PropertyEvent]]
         */
        onChanged(listener: {
            (event: PropertyEvent): void;
        }): void;
        /**
         * Deregister a listener-function.
         * @param listener
         * @see [[PropertyEvent]]
         */
        unChanged(listener: {
            (event: PropertyEvent): void;
        }): void;
        /**
         * Register a listener-function to be called when a [[Property]] has been added anywhere in the tree.
         * @param listener
         * @see [[PropertyAddedEvent]]
         */
        onPropertyAdded(listener: {
            (event: PropertyAddedEvent): void;
        }): void;
        /**
         * Deregister a listener-function.
         * @param listener
         * @see [[PropertyAddedEvent]]
         */
        unPropertyAdded(listener: {
            (event: PropertyAddedEvent): void;
        }): void;
        /**
         * Register a listener-function to be called when a [[Property]] has been removed anywhere in the tree.
         * @param listener
         * @see [[PropertyRemovedEvent]]
         */
        onPropertyRemoved(listener: {
            (event: PropertyRemovedEvent): void;
        }): void;
        /**
         * Deregister a listener-function.
         * @param listener
         * @see [[PropertyRemovedEvent]]
         */
        unPropertyRemoved(listener: {
            (event: PropertyRemovedEvent): void;
        }): void;
        /**
         * Register a listener-function to be called when a [[Property.index]] has changed anywhere in the tree.
         * @param listener
         * @see [[PropertyIndexChangedEvent]]
         */
        onPropertyIndexChanged(listener: {
            (event: PropertyIndexChangedEvent): void;
        }): void;
        /**
         * Deregister a listener-function.
         * @param listener
         * @see [[PropertyIndexChangedEvent]]
         */
        unPropertyIndexChanged(listener: {
            (event: PropertyIndexChangedEvent): void;
        }): void;
        /**
         * Register a listener-function to be called when a [[Property.value]] has changed anywhere in the tree.
         * @param listener
         * @see [[PropertyValueChangedEvent]]
         */
        onPropertyValueChanged(listener: {
            (event: PropertyValueChangedEvent): void;
        }): void;
        /**
         * Deregister a listener-function.
         * @param listener
         * @see [[PropertyValueChangedEvent]]
         */
        unPropertyValueChanged(listener: {
            (event: PropertyValueChangedEvent): void;
        }): void;
        static fromJson(json: PropertyArrayJson[]): PropertyTree;
        /**
         * Creates a new [[PropertySet]] attached to this tree.
         * The PropertySet is not added to the tree.
         */
        newPropertySet(): PropertySet;
        addPropertySet(name: string, value?: PropertySet): PropertySet;
        setPropertySet(name: string, index: number, value: PropertySet): Property;
        setPropertySetByPath(path: any, value: PropertySet): Property;
        getPropertySet(identifier: any, index?: number): PropertySet;
        getPropertySets(name: string): PropertySet[];
        addString(name: string, value: string): Property;
        addStrings(name: string, values: string[]): Property[];
        setString(name: string, index: number, value: string): Property;
        setStringByPath(path: any, value: string): Property;
        getString(identifier: any, index?: number): string;
        getStrings(name: string): string[];
        addLong(name: string, value: number): Property;
        addLongs(name: string, values: number[]): Property[];
        setLong(name: string, index: number, value: number): Property;
        setLongByPath(path: any, value: number): Property;
        getLong(identifier: string, index?: number): number;
        getLongs(name: string): number[];
        addDouble(name: string, value: number): Property;
        addDoubles(name: string, values: number[]): Property[];
        setDouble(name: string, index: number, value: number): Property;
        setDoubleByPath(path: any, value: number): Property;
        getDouble(identifier: string, index?: number): number;
        getDoubles(name: string): number[];
        addBoolean(name: string, value: boolean): Property;
        addBooleans(name: string, values: boolean[]): Property[];
        setBoolean(name: string, index: number, value: boolean): Property;
        setBooleanByPath(path: any, value: boolean): Property;
        getBoolean(identifier: string, index?: number): boolean;
        getBooleans(name: string): boolean[];
        addReference(name: string, value: Reference): Property;
        addReferences(name: string, values: Reference[]): Property[];
        setReference(name: string, index: number, value: Reference): Property;
        setReferenceByPath(path: any, value: Reference): Property;
        getReference(identifier: string, index?: number): Reference;
        getReferences(name: string): Reference[];
        addBinaryReference(name: string, value: BinaryReference): Property;
        addBinaryReferences(name: string, values: BinaryReference[]): Property[];
        setBinaryReference(name: string, index: number, value: BinaryReference): Property;
        setBinaryReferenceByPath(path: any, value: BinaryReference): Property;
        getBinaryReference(identifier: string, index?: number): BinaryReference;
        getBinaryReferences(name: string): BinaryReference[];
        addGeoPoint(name: string, value: GeoPoint): Property;
        addGeoPoints(name: string, values: GeoPoint[]): Property[];
        setGeoPoint(name: string, index: number, value: GeoPoint): Property;
        setGeoPointByPath(path: any, value: GeoPoint): Property;
        getGeoPoint(identifier: string, index?: number): GeoPoint;
        getGeoPoints(name: string): GeoPoint[];
        addLocalDate(name: string, value: api.util.LocalDate): Property;
        addLocalDates(name: string, values: api.util.LocalDate[]): Property[];
        setLocalDate(name: string, index: number, value: api.util.LocalDate): Property;
        setLocalDateByPath(path: any, value: api.util.LocalDate): Property;
        getLocalDate(identifier: string, index?: number): api.util.LocalDate;
        getLocalDates(name: string): api.util.LocalDate[];
        addLocalDateTime(name: string, value: api.util.LocalDateTime): Property;
        addLocalDateTimes(name: string, values: api.util.LocalDateTime[]): Property[];
        setLocalDateTime(name: string, index: number, value: api.util.LocalDateTime): Property;
        setLocalDateTimeByPath(path: any, value: api.util.LocalDateTime): Property;
        getLocalDateTime(identifier: string, index?: number): api.util.LocalDateTime;
        getLocalDateTimes(name: string): api.util.LocalDateTime[];
        addLocalTime(name: string, value: LocalTime): Property;
        addLocalTimes(name: string, values: LocalTime[]): Property[];
        setLocalTime(name: string, index: number, value: LocalTime): Property;
        setLocalTimeByPath(path: any, value: LocalTime): Property;
        getLocalTime(identifier: string, index?: number): LocalTime;
        getLocalTimes(name: string): LocalTime[];
        addDateTime(name: string, value: api.util.DateTime): Property;
        addDateTimes(name: string, values: api.util.DateTime[]): Property[];
        setDateTime(name: string, index: number, value: api.util.DateTime): Property;
        setDateTimeByPath(path: any, value: api.util.DateTime): Property;
        getDateTime(identifier: string, index?: number): api.util.DateTime;
        getDateTimes(name: string): api.util.DateTime[];
        isEmpty(): boolean;
    }
}
declare module api.icon {
    class IconUrlResolver {
        appendParam(paramName: string, paramValue: string, url: string): string;
    }
}
declare module api.security {
    enum PrincipalType {
        USER = 0,
        GROUP = 1,
        ROLE = 2,
    }
}
declare module api.security {
    class UserItemKey implements api.Equitable {
        private id;
        constructor(id: string);
        getId(): string;
        toString(): string;
        static fromString(str: string): UserItemKey;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.security {
    class UserStoreKey extends UserItemKey {
        static SYSTEM: UserStoreKey;
        constructor(id: string);
        isSystem(): boolean;
        static fromString(value: string): UserStoreKey;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.security {
    class PrincipalKey extends UserItemKey {
        private static SEPARATOR;
        private static ANONYMOUS_PRINCIPAL;
        private userStore;
        private type;
        private refString;
        static fromString(str: string): PrincipalKey;
        constructor(userStore: UserStoreKey, type: PrincipalType, principalId: string);
        getUserStore(): UserStoreKey;
        getType(): PrincipalType;
        isUser(): boolean;
        isGroup(): boolean;
        isRole(): boolean;
        isAnonymous(): boolean;
        toString(): string;
        toPath(toParent?: boolean): string;
        equals(o: api.Equitable): boolean;
        static ofAnonymous(): PrincipalKey;
        static ofUser(userStore: UserStoreKey, userId: string): PrincipalKey;
        static ofGroup(userStore: UserStoreKey, groupId: string): PrincipalKey;
        static ofRole(roleId: string): PrincipalKey;
    }
}
declare module api.security {
    class RoleKeys {
        static EVERYONE: PrincipalKey;
        static AUTHENTICATED: PrincipalKey;
        static ADMIN: PrincipalKey;
        static CMS_ADMIN: PrincipalKey;
        static CMS_EXPERT: PrincipalKey;
    }
}
declare module api.security {
    abstract class UserItem implements api.Equitable {
        private displayName;
        private description;
        private key;
        constructor(builder: UserItemBuilder);
        getDisplayName(): string;
        getDescription(): string;
        getKey(): UserItemKey;
        clone(): UserItem;
        abstract newBuilder(): UserItemBuilder;
        equals(o: api.Equitable): boolean;
    }
    abstract class UserItemBuilder {
        displayName: string;
        key: UserItemKey;
        description: string;
        constructor(source?: UserItem);
        fromJson(json: api.security.UserItemJson): UserItemBuilder;
        setDisplayName(displayName: string): UserItemBuilder;
        setDescription(description: string): UserItemBuilder;
        abstract build(): UserItem;
    }
}
declare module api.security {
    interface UserItemJson {
        displayName: string;
        key: string;
        description?: string;
    }
}
declare module api.security {
    class Principal extends UserItem {
        private type;
        private modifiedTime;
        constructor(builder: PrincipalBuilder);
        static fromPrincipal(principal: Principal): Principal;
        toJson(): PrincipalJson;
        getType(): PrincipalType;
        getKey(): PrincipalKey;
        getTypeName(): string;
        isUser(): boolean;
        isGroup(): boolean;
        isRole(): boolean;
        asUser(): User;
        asGroup(): Group;
        asRole(): Role;
        getModifiedTime(): Date;
        equals(o: api.Equitable): boolean;
        clone(): Principal;
        newBuilder(): PrincipalBuilder;
        static create(): PrincipalBuilder;
        static fromJson(json: api.security.PrincipalJson): Principal;
    }
    class PrincipalBuilder extends UserItemBuilder {
        modifiedTime: Date;
        constructor(source?: Principal);
        fromJson(json: api.security.PrincipalJson): PrincipalBuilder;
        setKey(key: PrincipalKey): PrincipalBuilder;
        setModifiedTime(modifiedTime: Date): PrincipalBuilder;
        build(): Principal;
    }
}
declare module api.security {
    interface PrincipalJson extends UserItemJson {
        modifiedTime?: string;
    }
}
declare module api.security {
    interface PrincipalsJson {
        principals: PrincipalJson[];
    }
}
declare module api.security {
    interface UserJson extends PrincipalJson {
        email: string;
        login: string;
        loginDisabled: boolean;
        memberships?: PrincipalJson[];
    }
}
declare module api.security {
    interface GroupJson extends PrincipalJson {
        members?: string[];
    }
}
declare module api.security {
    interface RoleJson extends PrincipalJson {
        members?: string[];
    }
}
declare module api.security {
    class User extends Principal {
        private email;
        private login;
        private loginDisabled;
        private memberships;
        constructor(builder: UserBuilder);
        getEmail(): string;
        getLogin(): string;
        isDisabled(): boolean;
        getMemberships(): Principal[];
        setMemberships(memberships: Principal[]): void;
        equals(o: api.Equitable): boolean;
        clone(): User;
        newBuilder(): UserBuilder;
        static create(): UserBuilder;
        static fromJson(json: api.security.UserJson): User;
    }
    class UserBuilder extends PrincipalBuilder {
        email: string;
        login: string;
        loginDisabled: boolean;
        memberships: Principal[];
        constructor(source?: User);
        fromJson(json: api.security.UserJson): UserBuilder;
        setEmail(value: string): UserBuilder;
        setLogin(value: string): UserBuilder;
        setDisabled(value: boolean): UserBuilder;
        setMemberships(memberships: Principal[]): UserBuilder;
        build(): User;
    }
}
declare module api.security {
    class Group extends Principal {
        private members;
        constructor(builder: GroupBuilder);
        getMembers(): PrincipalKey[];
        setMembers(members: PrincipalKey[]): void;
        addMember(member: PrincipalKey): void;
        equals(o: api.Equitable): boolean;
        clone(): Group;
        newBuilder(): GroupBuilder;
        static create(): GroupBuilder;
        static fromJson(json: api.security.GroupJson): Group;
    }
    class GroupBuilder extends PrincipalBuilder {
        members: PrincipalKey[];
        constructor(source?: Group);
        fromJson(json: api.security.GroupJson): GroupBuilder;
        setMembers(members: PrincipalKey[]): GroupBuilder;
        build(): Group;
    }
}
declare module api.security {
    class Role extends Principal {
        private members;
        constructor(builder: RoleBuilder);
        getMembers(): PrincipalKey[];
        equals(o: api.Equitable): boolean;
        clone(): Role;
        newBuilder(): RoleBuilder;
        static create(): RoleBuilder;
        static fromJson(json: api.security.RoleJson): Role;
    }
    class RoleBuilder extends PrincipalBuilder {
        members: PrincipalKey[];
        constructor(source?: Role);
        fromJson(json: api.security.RoleJson): RoleBuilder;
        setMembers(members: PrincipalKey[]): RoleBuilder;
        build(): Role;
    }
}
declare module api.security {
    class UserStore extends UserItem {
        private authConfig;
        private idProviderMode;
        private permissions;
        constructor(builder: UserStoreBuilder);
        getAuthConfig(): AuthConfig;
        getIdProviderMode(): IdProviderMode;
        getPermissions(): api.security.acl.UserStoreAccessControlList;
        isDeletable(): wemQ.Promise<boolean>;
        static checkOnDeletable(key: UserStoreKey): wemQ.Promise<boolean>;
        getKey(): UserStoreKey;
        equals(o: api.Equitable): boolean;
        clone(): UserStore;
        newBuilder(): UserStoreBuilder;
        static create(): UserStoreBuilder;
        static fromJson(json: api.security.UserStoreJson): UserStore;
    }
    class UserStoreBuilder extends UserItemBuilder {
        authConfig: AuthConfig;
        idProviderMode: IdProviderMode;
        permissions: api.security.acl.UserStoreAccessControlList;
        constructor(source?: UserStore);
        fromJson(json: api.security.UserStoreJson): UserStoreBuilder;
        setKey(key: string): UserStoreBuilder;
        setAuthConfig(authConfig: AuthConfig): UserStoreBuilder;
        setIdProviderMode(idProviderMode: IdProviderMode): UserStoreBuilder;
        setPermissions(permissions: api.security.acl.UserStoreAccessControlList): UserStoreBuilder;
        build(): UserStore;
    }
}
declare module api.security {
    interface UserStoreJson extends UserItemJson {
        authConfig?: AuthConfigJson;
        idProviderMode: string;
        permissions?: api.security.acl.UserStoreAccessControlEntryJson[];
    }
}
declare module api.security {
    import UserStoreJson = api.security.UserStoreJson;
    class UserStoreListResult {
        userStores: UserStoreJson[];
    }
}
declare module api.security {
    class SecurityResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourcePath;
        constructor();
        getResourcePath(): api.rest.Path;
        fromJsonToPrincipal(json: api.security.PrincipalJson): Principal;
    }
}
declare module api.security {
    class ListUserStoresRequest extends SecurityResourceRequest<UserStoreListResult, UserStore[]> {
        constructor();
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<UserStore[]>;
        fromJsonToUserStore(json: UserStoreJson): UserStore;
    }
}
declare module api.security {
    class GetUserStoreByKeyRequest extends SecurityResourceRequest<UserStoreJson, UserStore> {
        private userStoreKey;
        constructor(userStoreKey: UserStoreKey);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<UserStore>;
        fromJsonToUserStore(json: UserStoreJson): UserStore;
    }
}
declare module api.security {
    class GetDefaultUserStoreRequest extends SecurityResourceRequest<UserStoreJson, UserStore> {
        constructor();
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<UserStore>;
        fromJsonToUserStore(json: UserStoreJson): UserStore;
    }
}
declare module api.security {
    class PrincipalListJson {
        principals: api.security.PrincipalJson[];
    }
}
declare module api.security {
    class FindPrincipalsRequest extends api.security.SecurityResourceRequest<FindPrincipalsResultJson, FindPrincipalsResult> {
        private allowedTypes;
        private searchQuery;
        private userStoreKey;
        private filterPredicate;
        private from;
        private size;
        constructor();
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<FindPrincipalsResult>;
        private enumToStrings(types);
        setUserStoreKey(key: UserStoreKey): FindPrincipalsRequest;
        setAllowedTypes(types: PrincipalType[]): FindPrincipalsRequest;
        setFrom(from: number): FindPrincipalsRequest;
        setSize(size: number): FindPrincipalsRequest;
        setSearchQuery(query: string): FindPrincipalsRequest;
        setResultFilter(filterPredicate: (principal: Principal) => boolean): void;
    }
}
declare module api.security {
    class FindPrincipalsResult {
        private principals;
        private totalSize;
        constructor(principals: Principal[], totalSize: number);
        getPrincipals(): Principal[];
        getTotalSize(): number;
        static fromJson(json: FindPrincipalsResultJson): FindPrincipalsResult;
    }
}
declare module api.security {
    class FindPrincipalListRequest extends api.security.SecurityResourceRequest<PrincipalListJson, Principal[]> {
        private request;
        constructor();
        sendAndParse(): wemQ.Promise<Principal[]>;
        setUserStoreKey(key: UserStoreKey): FindPrincipalListRequest;
        setAllowedTypes(types: PrincipalType[]): FindPrincipalListRequest;
        setSearchQuery(query: string): FindPrincipalListRequest;
        setResultFilter(filterPredicate: (principal: Principal) => boolean): void;
    }
}
declare module api.security {
    interface FindPrincipalsResultJson {
        principals: api.security.PrincipalJson[];
        totalSize: number;
    }
}
declare module api.security {
    class GetPrincipalByKeyRequest extends SecurityResourceRequest<PrincipalJson, Principal> {
        private principalKey;
        private includeMemberships;
        constructor(principalKey: PrincipalKey);
        includeUserMemberships(includeMemberships: boolean): GetPrincipalByKeyRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Principal>;
    }
}
declare module api.security {
    class GetPrincipalsByUserStoreRequest extends SecurityResourceRequest<PrincipalListJson, Principal[]> {
        private userStore;
        private principalTypes;
        constructor(userStore: UserStoreKey, principalTypes: PrincipalType[]);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        private getType();
        sendAndParse(): wemQ.Promise<Principal[]>;
    }
}
declare module api.security {
    interface CheckEmailAvailabilityResponse {
        available: boolean;
    }
    class CheckEmailAvailabilityRequest extends SecurityResourceRequest<CheckEmailAvailabilityResponse, boolean> {
        private userStoreKey;
        private email;
        constructor(email: string);
        setUserStoreKey(key: UserStoreKey): CheckEmailAvailabilityRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<boolean>;
    }
}
declare module api.security {
    class SetUserPasswordRequest extends SecurityResourceRequest<UserJson, User> {
        private key;
        private password;
        constructor();
        setKey(key: PrincipalKey): SetUserPasswordRequest;
        setPassword(password: string): SetUserPasswordRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<User>;
    }
}
declare module api.security {
    class CreateUserRequest extends SecurityResourceRequest<UserJson, User> {
        private key;
        private displayName;
        private email;
        private login;
        private password;
        private memberships;
        constructor();
        setKey(key: PrincipalKey): CreateUserRequest;
        setDisplayName(displayName: string): CreateUserRequest;
        setEmail(email: string): CreateUserRequest;
        setLogin(login: string): CreateUserRequest;
        setPassword(password: string): CreateUserRequest;
        setMemberships(memberships: PrincipalKey[]): CreateUserRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<User>;
    }
}
declare module api.security {
    class CreateGroupRequest extends SecurityResourceRequest<GroupJson, Group> {
        private key;
        private displayName;
        private members;
        private description;
        constructor();
        setKey(key: PrincipalKey): CreateGroupRequest;
        setDisplayName(displayName: string): CreateGroupRequest;
        setMembers(members: PrincipalKey[]): CreateGroupRequest;
        setDescription(description: string): CreateGroupRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Group>;
    }
}
declare module api.security {
    class CreateRoleRequest extends SecurityResourceRequest<RoleJson, Role> {
        private key;
        private displayName;
        private members;
        private description;
        constructor();
        setKey(key: PrincipalKey): CreateRoleRequest;
        setDisplayName(displayName: string): CreateRoleRequest;
        setMembers(members: PrincipalKey[]): CreateRoleRequest;
        setDescription(description: string): CreateRoleRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Role>;
    }
}
declare module api.security {
    class UpdateUserRequest extends SecurityResourceRequest<UserJson, User> {
        private key;
        private displayName;
        private email;
        private login;
        private membershipsToAdd;
        private membershipsToRemove;
        constructor();
        setKey(key: PrincipalKey): UpdateUserRequest;
        setDisplayName(displayName: string): UpdateUserRequest;
        setEmail(email: string): UpdateUserRequest;
        setLogin(login: string): UpdateUserRequest;
        addMemberships(memberships: PrincipalKey[]): UpdateUserRequest;
        removeMemberships(memberships: PrincipalKey[]): UpdateUserRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<User>;
    }
}
declare module api.security {
    class UpdateGroupRequest extends SecurityResourceRequest<GroupJson, Group> {
        private key;
        private displayName;
        private membersToAdd;
        private membersToRemove;
        private description;
        constructor();
        setKey(key: PrincipalKey): UpdateGroupRequest;
        setDisplayName(displayName: string): UpdateGroupRequest;
        addMembers(members: PrincipalKey[]): UpdateGroupRequest;
        removeMembers(members: PrincipalKey[]): UpdateGroupRequest;
        setDescription(description: string): UpdateGroupRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Group>;
    }
}
declare module api.security {
    class UpdateRoleRequest extends SecurityResourceRequest<RoleJson, Role> {
        private key;
        private displayName;
        private membersToAdd;
        private membersToRemove;
        private description;
        constructor();
        setKey(key: PrincipalKey): UpdateRoleRequest;
        setDisplayName(displayName: string): UpdateRoleRequest;
        setDescription(description: string): UpdateRoleRequest;
        addMembers(members: PrincipalKey[]): UpdateRoleRequest;
        removeMembers(members: PrincipalKey[]): UpdateRoleRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Role>;
    }
}
declare module api.security {
    class DeletePrincipalResult {
        private principalKey;
        private deleted;
        private reason;
        getPrincipalKey(): PrincipalKey;
        isDeleted(): boolean;
        getReason(): string;
        static fromJson(json: api.security.DeletePrincipalResultJson): DeletePrincipalResult;
    }
}
declare module api.security {
    class DeleteUserStoreResult {
        private userStoreKey;
        private deleted;
        private reason;
        getUserStoreKey(): UserStoreKey;
        isDeleted(): boolean;
        getReason(): string;
        static fromJson(json: api.security.DeleteUserStoreResultJson): DeleteUserStoreResult;
    }
}
declare module api.security {
    interface DeletePrincipalResultJson {
        principalKey: string;
        deleted: boolean;
        reason: string;
    }
}
declare module api.security {
    interface DeleteUserStoreResultJson {
        userStoreKey: string;
        deleted: boolean;
        reason: string;
    }
}
declare module api.security {
    interface DeletePrincipalResultsJson {
        results: DeletePrincipalResultJson[];
    }
}
declare module api.security {
    interface DeleteUserStoreResultsJson {
        results: DeleteUserStoreResultJson[];
    }
}
declare module api.security {
    class DeletePrincipalRequest extends SecurityResourceRequest<DeletePrincipalResultsJson, DeletePrincipalResult[]> {
        private keys;
        constructor();
        setKeys(keys: PrincipalKey[]): DeletePrincipalRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<DeletePrincipalResult[]>;
    }
}
declare module api.security {
    class DeleteUserStoreRequest extends SecurityResourceRequest<DeleteUserStoreResultsJson, DeleteUserStoreResult[]> {
        private keys;
        constructor();
        setKeys(keys: UserStoreKey[]): DeleteUserStoreRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<DeleteUserStoreResult[]>;
    }
}
declare module api.security {
    class SyncUserStoreRequest extends SecurityResourceRequest<SyncUserStoreResultsJson, SyncUserStoreResult[]> {
        private keys;
        constructor();
        setKeys(keys: UserStoreKey[]): SyncUserStoreRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<SyncUserStoreResult[]>;
    }
}
declare module api.security {
    class SyncUserStoreResult {
        private userStoreKey;
        private synchronized;
        private reason;
        getUserStoreKey(): UserStoreKey;
        isSynchronized(): boolean;
        getReason(): string;
        static fromJson(json: api.security.SyncUserStoreResultJson): SyncUserStoreResult;
    }
}
declare module api.security {
    interface SyncUserStoreResultJson {
        userStoreKey: string;
        synchronized: boolean;
        reason: string;
    }
}
declare module api.security {
    interface SyncUserStoreResultsJson {
        results: SyncUserStoreResultJson[];
    }
}
declare module api.security {
    class PrincipalLoader extends api.util.loader.BaseLoader<any, any> {
        protected request: FindPrincipalListRequest;
        private skipPrincipalKeys;
        constructor();
        protected createRequest(): FindPrincipalListRequest;
        protected getRequest(): FindPrincipalListRequest;
        setUserStoreKey(key: UserStoreKey): PrincipalLoader;
        setAllowedTypes(principalTypes: PrincipalType[]): PrincipalLoader;
        search(searchString: string): wemQ.Promise<Principal[]>;
        skipPrincipals(principalKeys: PrincipalKey[]): PrincipalLoader;
        skipPrincipal(principalKey: PrincipalKey): PrincipalLoader;
    }
}
declare module api.security {
    class PrincipalNamedEvent extends api.event.Event {
        private wizard;
        private principal;
        constructor(wizard: api.app.wizard.WizardPanel<Principal>, principal: Principal);
        getWizard(): api.app.wizard.WizardPanel<Principal>;
        getPrincipal(): Principal;
        static on(handler: (event: PrincipalNamedEvent) => void): void;
        static un(handler?: (event: PrincipalNamedEvent) => void): void;
    }
}
declare module api.security {
    class CreateUserStoreRequest extends SecurityResourceRequest<UserStoreJson, UserStore> {
        private userStoreKey;
        private displayName;
        private description;
        private authConfig;
        private permissions;
        constructor();
        getParams(): Object;
        setKey(userStoreKey: UserStoreKey): CreateUserStoreRequest;
        setDisplayName(displayName: string): CreateUserStoreRequest;
        setDescription(description: string): CreateUserStoreRequest;
        setAuthConfig(authConfig: AuthConfig): CreateUserStoreRequest;
        setPermissions(permissions: api.security.acl.UserStoreAccessControlList): CreateUserStoreRequest;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<UserStore>;
        fromJsonToUserStore(json: UserStoreJson): UserStore;
    }
}
declare module api.security {
    class UpdateUserStoreRequest extends SecurityResourceRequest<UserStoreJson, UserStore> {
        private userStoreKey;
        private displayName;
        private description;
        private authConfig;
        private permissions;
        constructor();
        getParams(): Object;
        setKey(userStoreKey: UserStoreKey): UpdateUserStoreRequest;
        setDisplayName(displayName: string): UpdateUserStoreRequest;
        setDescription(description: string): UpdateUserStoreRequest;
        setAuthConfig(authConfig: AuthConfig): UpdateUserStoreRequest;
        setPermissions(permissions: api.security.acl.UserStoreAccessControlList): UpdateUserStoreRequest;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<UserStore>;
        fromJsonToUserStore(json: UserStoreJson): UserStore;
    }
}
declare module api.security {
    class UserStoreNamedEvent extends api.event.Event {
        private wizard;
        private userStore;
        constructor(wizard: api.app.wizard.WizardPanel<UserStore>, userStore: UserStore);
        getWizard(): api.app.wizard.WizardPanel<UserStore>;
        getUserStore(): UserStore;
        static on(handler: (event: UserStoreNamedEvent) => void): void;
        static un(handler?: (event: UserStoreNamedEvent) => void): void;
    }
}
declare module api.security {
    class UserItemCreatedEvent extends api.event.Event {
        private principal;
        private userStore;
        private parentOfSameType;
        constructor(principal: Principal, userStore: UserStore, parentOfSameType?: boolean);
        getPrincipal(): Principal;
        getUserStore(): UserStore;
        isParentOfSameType(): boolean;
        static on(handler: (event: UserItemCreatedEvent) => void): void;
        static un(handler?: (event: UserItemCreatedEvent) => void): void;
    }
}
declare module api.security {
    class UserItemUpdatedEvent extends api.event.Event {
        private principal;
        private userStore;
        constructor(principal: Principal, userStore: UserStore);
        getPrincipal(): Principal;
        getUserStore(): UserStore;
        static on(handler: (event: UserItemUpdatedEvent) => void): void;
        static un(handler?: (event: UserItemUpdatedEvent) => void): void;
    }
}
declare module api.security {
    class UserItemDeletedEvent extends api.event.Event {
        private principals;
        private userStores;
        constructor(builder: UserItemDeletedEventBuilder);
        getPrincipals(): Principal[];
        getUserStores(): UserStore[];
        static create(): UserItemDeletedEventBuilder;
        static on(handler: (event: UserItemDeletedEvent) => void): void;
        static un(handler?: (event: UserItemDeletedEvent) => void): void;
    }
    class UserItemDeletedEventBuilder {
        principals: Principal[];
        userStores: UserStore[];
        setPrincipals(principals: Principal[]): UserItemDeletedEventBuilder;
        setUserStores(userStores: UserStore[]): UserItemDeletedEventBuilder;
        build(): UserItemDeletedEvent;
    }
}
declare module api.security {
    class AuthConfig implements api.Equitable {
        private applicationKey;
        private config;
        constructor(builder: AuthConfigBuilder);
        getApplicationKey(): api.application.ApplicationKey;
        getConfig(): api.data.PropertyTree;
        equals(o: api.Equitable): boolean;
        toJson(): AuthConfigJson;
        clone(): AuthConfig;
        static create(): AuthConfigBuilder;
        static fromJson(json: AuthConfigJson): AuthConfig;
    }
    class AuthConfigBuilder {
        applicationKey: api.application.ApplicationKey;
        config: api.data.PropertyTree;
        setApplicationKey(applicationKey: api.application.ApplicationKey): AuthConfigBuilder;
        setConfig(config: api.data.PropertyTree): AuthConfigBuilder;
        fromJson(json: api.security.AuthConfigJson): AuthConfigBuilder;
        build(): AuthConfig;
    }
}
declare module api.security {
    interface AuthConfigJson {
        applicationKey: string;
        config: api.data.PropertyArrayJson[];
    }
}
declare module api.security {
    enum IdProviderMode {
        LOCAL = 0,
        EXTERNAL = 1,
        MIXED = 2,
    }
}
declare module api.security.acl {
    /**
     *  enum Color{
     *      Red, Green
     *  }
     *
     *  // To String
     *  var green: string = Color[Color.Green];
     *
     *  // To Enum / number
     *  var color : Color = Color[green];
     */
    enum Permission {
        READ = 0,
        CREATE = 1,
        MODIFY = 2,
        DELETE = 3,
        PUBLISH = 4,
        READ_PERMISSIONS = 5,
        WRITE_PERMISSIONS = 6,
    }
    enum PermissionState {
        ALLOW = 0,
        DENY = 1,
        INHERIT = 2,
    }
}
declare module api.security.acl {
    class PermissionHelper {
        static hasPermission(permission: api.security.acl.Permission, loginResult: api.security.auth.LoginResult, accessControlList: AccessControlList): boolean;
        static isPrincipalPresent(principalKey: api.security.PrincipalKey, accessEntriesToCheck: AccessControlEntry[]): boolean;
    }
}
declare module api.security.acl {
    interface AccessControlEntryJson {
        principal: PrincipalJson;
        allow: string[];
        deny: string[];
    }
}
declare module api.security.acl {
    import Principal = api.security.Principal;
    class AccessControlEntry implements api.Equitable, api.Cloneable {
        private static ALL_PERMISSIONS;
        private principal;
        private allowedPermissions;
        private deniedPermissions;
        constructor(principal: Principal);
        getPrincipal(): Principal;
        getPrincipalKey(): PrincipalKey;
        getPrincipalDisplayName(): string;
        getPrincipalTypeName(): string;
        getAllowedPermissions(): Permission[];
        getDeniedPermissions(): Permission[];
        setAllowedPermissions(permissions: Permission[]): void;
        setDeniedPermissions(permissions: Permission[]): void;
        isAllowed(permission: Permission): boolean;
        isDenied(permission: Permission): boolean;
        isSet(permission: Permission): boolean;
        allow(permission: Permission): AccessControlEntry;
        deny(permission: Permission): AccessControlEntry;
        remove(permission: Permission): AccessControlEntry;
        equals(o: api.Equitable): boolean;
        toString(): string;
        clone(): AccessControlEntry;
        toJson(): api.security.acl.AccessControlEntryJson;
        static fromJson(json: api.security.acl.AccessControlEntryJson): AccessControlEntry;
    }
}
declare module api.security.acl {
    import PrincipalListJson = api.security.PrincipalListJson;
    import PrincipalType = api.security.PrincipalType;
    import UserStoreKey = api.security.UserStoreKey;
    class FindAccessControlEntriesRequest extends api.security.SecurityResourceRequest<PrincipalListJson, AccessControlEntry[]> {
        private allowedTypes;
        private searchQuery;
        private userStoreKey;
        constructor();
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<AccessControlEntry[]>;
        private enumToStrings(types);
        setUserStoreKey(key: UserStoreKey): FindAccessControlEntriesRequest;
        setAllowedTypes(types: PrincipalType[]): FindAccessControlEntriesRequest;
        setSearchQuery(query: string): FindAccessControlEntriesRequest;
    }
    class AccessControlEntryLoader extends api.util.loader.BaseLoader<PrincipalListJson, AccessControlEntry> {
        protected request: FindAccessControlEntriesRequest;
        constructor();
        protected createRequest(): FindAccessControlEntriesRequest;
        protected getRequest(): FindAccessControlEntriesRequest;
        setUserStoreKey(key: UserStoreKey): AccessControlEntryLoader;
        setAllowedTypes(principalTypes: PrincipalType[]): AccessControlEntryLoader;
        search(searchString: string): wemQ.Promise<AccessControlEntry[]>;
    }
}
declare module api.security.acl {
    import PermissionsJson = api.content.json.PermissionsJson;
    class AccessControlList implements api.Equitable, api.Cloneable {
        private entries;
        constructor(entries?: AccessControlEntry[]);
        getEntries(): AccessControlEntry[];
        getEntry(principalKey: PrincipalKey): AccessControlEntry;
        add(entry: AccessControlEntry): void;
        addAll(entries: AccessControlEntry[]): void;
        contains(principalKey: PrincipalKey): boolean;
        remove(principalKey: PrincipalKey): void;
        toJson(): api.security.acl.AccessControlEntryJson[];
        toString(): string;
        equals(o: api.Equitable): boolean;
        clone(): AccessControlList;
        static fromJson(json: PermissionsJson): AccessControlList;
    }
}
declare module api.security.acl {
    import ContentsPermissionsEntryJson = api.content.json.ContentPermissionsJson;
    class ContentAccessControlList extends AccessControlList implements api.Equitable, api.Cloneable {
        private contentId;
        constructor(id: string, entries?: AccessControlEntry[]);
        getContentId(): api.content.ContentId;
        toString(): string;
        equals(o: api.Equitable): boolean;
        clone(): ContentAccessControlList;
        static fromJson(json: ContentsPermissionsEntryJson): ContentAccessControlList;
    }
}
declare module api.security.acl {
    enum UserStoreAccess {
        READ = 0,
        CREATE_USERS = 1,
        WRITE_USERS = 2,
        USER_STORE_MANAGER = 3,
        ADMINISTRATOR = 4,
    }
}
declare module api.security.acl {
    interface UserStoreAccessControlEntryJson {
        access: string;
        principal: PrincipalJson;
    }
}
declare module api.security.acl {
    class UserStoreAccessControlEntry implements api.Equitable {
        private principal;
        private access;
        constructor(principal: Principal, access?: UserStoreAccess);
        getPrincipal(): Principal;
        getAccess(): UserStoreAccess;
        setAccess(value: string): UserStoreAccessControlEntry;
        getPrincipalKey(): PrincipalKey;
        getPrincipalDisplayName(): string;
        getPrincipalTypeName(): string;
        equals(o: api.Equitable): boolean;
        getId(): string;
        toString(): string;
        toJson(): api.security.acl.UserStoreAccessControlEntryJson;
        static fromJson(json: api.security.acl.UserStoreAccessControlEntryJson): UserStoreAccessControlEntry;
    }
}
declare module api.security.acl {
    class UserStoreAccessControlList implements api.Equitable {
        private entries;
        constructor(entries?: UserStoreAccessControlEntry[]);
        getEntries(): UserStoreAccessControlEntry[];
        getEntry(principalKey: PrincipalKey): UserStoreAccessControlEntry;
        add(entry: UserStoreAccessControlEntry): void;
        addAll(entries: UserStoreAccessControlEntry[]): void;
        contains(principalKey: PrincipalKey): boolean;
        remove(principalKey: PrincipalKey): void;
        toJson(): api.security.acl.UserStoreAccessControlEntryJson[];
        toString(): string;
        equals(o: api.Equitable): boolean;
        static fromJson(json: api.security.acl.UserStoreAccessControlEntryJson[]): UserStoreAccessControlList;
        clone(): UserStoreAccessControlList;
    }
}
declare module api.security.acl {
    import PrincipalListJson = api.security.PrincipalListJson;
    import PrincipalType = api.security.PrincipalType;
    import UserStoreKey = api.security.UserStoreKey;
    import SecurityResourceRequest = api.security.SecurityResourceRequest;
    class FindUserStoreAccessControlEntriesRequest extends SecurityResourceRequest<PrincipalListJson, UserStoreAccessControlEntry[]> {
        private allowedTypes;
        private searchQuery;
        private userStoreKey;
        constructor();
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<UserStoreAccessControlEntry[]>;
        private enumToStrings(types);
        setUserStoreKey(key: UserStoreKey): FindUserStoreAccessControlEntriesRequest;
        setAllowedTypes(types: PrincipalType[]): FindUserStoreAccessControlEntriesRequest;
        setSearchQuery(query: string): FindUserStoreAccessControlEntriesRequest;
    }
    class UserStoreAccessControlEntryLoader extends api.util.loader.BaseLoader<PrincipalListJson, UserStoreAccessControlEntry> {
        protected request: FindUserStoreAccessControlEntriesRequest;
        constructor();
        protected createRequest(): FindUserStoreAccessControlEntriesRequest;
        protected getRequest(): FindUserStoreAccessControlEntriesRequest;
        setUserStoreKey(key: UserStoreKey): UserStoreAccessControlEntryLoader;
        setAllowedTypes(principalTypes: PrincipalType[]): UserStoreAccessControlEntryLoader;
        search(searchString: string): wemQ.Promise<UserStoreAccessControlEntry[]>;
    }
}
declare module api.security.auth {
    class LoginCredentials {
        private user;
        private password;
        private rememberMe;
        constructor();
        getUser(): string;
        getPassword(): string;
        isRememberMe(): boolean;
        setUser(user: string): LoginCredentials;
        setPassword(pwd: string): LoginCredentials;
        setRememberMe(value: boolean): LoginCredentials;
    }
}
declare module api.security.auth {
    interface LoginResultJson {
        authenticated: boolean;
        user: api.security.UserJson;
        principals: string[];
        message?: string;
    }
}
declare module api.security.auth {
    class LoginResult {
        private authenticated;
        private user;
        private principals;
        private message;
        constructor(json: LoginResultJson);
        isAuthenticated(): boolean;
        getUser(): api.security.User;
        getPrincipals(): api.security.PrincipalKey[];
        getMessage(): string;
    }
}
declare module api.security.auth {
    class AuthResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourcePath;
        constructor();
        getResourcePath(): api.rest.Path;
    }
}
declare module api.security.auth {
    class LoginRequest extends AuthResourceRequest<LoginResultJson, LoginResult> {
        private loginCredentials;
        constructor(loginCredentials: LoginCredentials);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<LoginResult>;
    }
}
declare module api.security.auth {
    interface LogoutResultJson {
    }
}
declare module api.security.auth {
    class LogoutRequest extends AuthResourceRequest<LogoutResultJson, void> {
        constructor();
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<void>;
    }
}
declare module api.security.auth {
    class IsAuthenticatedRequest extends AuthResourceRequest<LoginResultJson, LoginResult> {
        constructor();
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<LoginResult>;
    }
}
declare module api.security.auth {
    import BaseLoader = api.util.loader.BaseLoader;
    import ApplicationListResult = api.application.ApplicationListResult;
    import Application = api.application.Application;
    class AuthApplicationLoader extends BaseLoader<ApplicationListResult, Application> {
        constructor();
        filterFn(application: api.application.Application): boolean;
    }
}
declare module api.security.event {
    /**
     * Class that listens to server events and fires UI events
     */
    class PrincipalServerEventsHandler {
        private static instance;
        private handler;
        private principalDeletedListeners;
        private static debug;
        static getInstance(): PrincipalServerEventsHandler;
        start(): void;
        stop(): void;
        private principalServerEventHandler(event);
        private handleContentDeleted(oldPaths);
        private extractContentPaths(changes, useNewPaths?);
        onPrincipalDeleted(listener: (paths: string[]) => void): void;
        unPrincipalDeleted(listener: (paths: string[]) => void): void;
        private notifyPrincipalDeleted(paths);
    }
}
declare module api.security.event {
    import NodeServerChangeType = api.event.NodeServerChangeType;
    class PrincipalServerEvent extends api.event.NodeServerEvent {
        constructor(change: PrincipalServerChange);
        getType(): NodeServerChangeType;
        getNodeChange(): PrincipalServerChange;
        static is(eventJson: api.event.NodeEventJson): boolean;
        static fromJson(nodeEventJson: api.event.NodeEventJson): PrincipalServerEvent;
    }
}
declare module api.security.event {
    import NodeEventJson = api.event.NodeEventJson;
    import NodeEventNodeJson = api.event.NodeEventNodeJson;
    import NodeServerChange = api.event.NodeServerChange;
    import NodeServerChangeType = api.event.NodeServerChangeType;
    import NodeServerChangeItem = api.event.NodeServerChangeItem;
    class PrincipalServerChangeItem extends NodeServerChangeItem<string> {
        static fromJson(node: NodeEventNodeJson): PrincipalServerChangeItem;
    }
    class PrincipalServerChange extends NodeServerChange<string> {
        constructor(type: NodeServerChangeType, changeItems: PrincipalServerChangeItem[], newPrincipalPaths?: string[]);
        getChangeType(): NodeServerChangeType;
        toString(): string;
        static fromJson(nodeEventJson: NodeEventJson): PrincipalServerChange;
    }
}
declare module api.security.event {
    class PrincipalDeletedEvent extends api.event.Event {
        private principalDeletedPaths;
        constructor();
        addItem(principalPath: string): PrincipalDeletedEvent;
        getDeletedItems(): string[];
        isEmpty(): boolean;
        fire(): void;
        static on(handler: (event: PrincipalDeletedEvent) => void): void;
        static un(handler?: (event: PrincipalDeletedEvent) => void): void;
    }
}
declare module api.locale {
    class Locale implements api.Equitable {
        private tag;
        private displayName;
        private language;
        private displayLanguage;
        private variant;
        private displayVariant;
        private country;
        private displayCountry;
        equals(other: api.Equitable): boolean;
        static fromJson(json: api.locale.json.LocaleJson): Locale;
        getTag(): string;
        getDisplayName(): string;
        getLanguage(): string;
        getDisplayLanguage(): string;
        getVariant(): string;
        getDisplayVariant(): string;
        getCountry(): string;
        getDisplayCountry(): string;
    }
}
declare module api.locale {
    import LocaleListJson = api.locale.json.LocaleListJson;
    class GetLocalesRequest extends api.rest.ResourceRequest<LocaleListJson, Locale[]> {
        private searchQuery;
        constructor();
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        setSearchQuery(query: string): GetLocalesRequest;
        sendAndParse(): wemQ.Promise<Locale[]>;
        private sortFunction(a, b);
    }
}
declare module api.locale {
    class LocaleLoader extends api.util.loader.BaseLoader<api.locale.json.LocaleListJson, Locale> {
        private preservedSearchString;
        protected request: GetLocalesRequest;
        protected createRequest(): GetLocalesRequest;
        protected getRequest(): GetLocalesRequest;
        search(searchString: string): wemQ.Promise<Locale[]>;
        load(): wemQ.Promise<Locale[]>;
    }
}
declare module api.locale.json {
    interface LocaleJson {
        tag: string;
        displayName: string;
        language: string;
        displayLanguage: string;
        variant: string;
        displayVariant: string;
        country: string;
        displayCountry: string;
    }
}
declare module api.locale.json {
    interface LocaleListJson {
        locales: LocaleJson[];
    }
}
declare module api.task {
    class TaskId implements api.Equitable {
        private value;
        constructor(value: string);
        static fromString(str: string): TaskId;
        toString(): string;
        equals(o: api.Equitable): boolean;
        static fromJson(json: TaskIdJson): TaskId;
    }
}
declare module api.task {
    interface TaskIdJson {
        taskId: string;
    }
}
declare module api.task {
    enum TaskState {
        WAITING = 0,
        RUNNING = 1,
        FINISHED = 2,
        FAILED = 3,
    }
}
declare module api.task {
    interface TaskInfoJson {
        id: string;
        description: string;
        state: string;
        progress: TaskProgressJson;
    }
}
declare module api.task {
    interface TaskInfosJson {
        tasks: TaskInfoJson[];
    }
}
declare module api.task {
    interface TaskProgressJson {
        info: string;
        current: number;
        total: number;
    }
}
declare module api.task {
    class TaskProgress {
        private info;
        private current;
        private total;
        constructor(builder: TaskProgressBuilder);
        getInfo(): string;
        getCurrent(): number;
        getTotal(): number;
        static create(): TaskProgressBuilder;
    }
    class TaskProgressBuilder {
        info: string;
        current: number;
        total: number;
        fromSource(source: TaskProgress): TaskProgressBuilder;
        fromJson(json: api.task.TaskProgressJson): TaskProgressBuilder;
        setInfo(info: string): TaskProgressBuilder;
        setCurrent(current: number): TaskProgressBuilder;
        setTotal(total: number): TaskProgressBuilder;
        build(): TaskProgress;
    }
}
declare module api.task {
    class TaskInfo {
        private id;
        private description;
        private state;
        private progress;
        constructor(builder: TaskInfoBuilder);
        getId(): TaskId;
        getDescription(): string;
        getState(): TaskState;
        getProgress(): TaskProgress;
        getProgressPercentage(): number;
        static fromJson(json: api.task.TaskInfoJson): TaskInfo;
        static create(): TaskInfoBuilder;
    }
    class TaskInfoBuilder {
        id: TaskId;
        description: string;
        state: TaskState;
        progress: TaskProgress;
        fromSource(source: TaskInfo): TaskInfoBuilder;
        setId(id: TaskId): TaskInfoBuilder;
        setDescription(description: string): TaskInfoBuilder;
        setState(state: TaskState): TaskInfoBuilder;
        setProgress(progress: TaskProgress): TaskInfoBuilder;
        build(): TaskInfo;
    }
}
declare module api.task {
    class TaskResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourcePath;
        constructor();
        getResourcePath(): api.rest.Path;
    }
}
declare module api.task {
    class GetTaskInfoRequest extends TaskResourceRequest<TaskInfoJson, TaskInfo> {
        protected taskId: TaskId;
        constructor(taskId: TaskId);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<TaskInfo>;
    }
}
declare module api.ui.responsive {
    class ResponsiveRange {
        private minRange;
        private maxRange;
        private rangeClass;
        constructor(minRange: number, maxRange?: number, rangeClass?: string);
        getMinimumRange(): number;
        getMaximumRange(): number;
        getRangeClass(): string;
        isFit(size: number): boolean;
        isFitOrSmaller(size: number): boolean;
        isFitOrBigger(size: number): boolean;
    }
}
declare module api.ui.responsive {
    class ResponsiveRanges {
        static _0_240: ResponsiveRange;
        static _240_360: ResponsiveRange;
        static _360_540: ResponsiveRange;
        static _540_720: ResponsiveRange;
        static _720_960: ResponsiveRange;
        static _960_1200: ResponsiveRange;
        static _1200_1380: ResponsiveRange;
        static _1380_1620: ResponsiveRange;
        static _1620_1920: ResponsiveRange;
        static _1920_UP: ResponsiveRange;
    }
}
declare module api.ui.responsive {
    class ResponsiveItem {
        private element;
        private rangeSize;
        private oldRangeSize;
        private rangeValue;
        private oldRangeValue;
        private handle;
        constructor(element: api.dom.Element, handler?: (item: ResponsiveItem) => void);
        private fitToRange();
        getElement(): api.dom.Element;
        update(): void;
        isRangeSizeChanged(): boolean;
        setHandler(handler?: (item: ResponsiveItem) => void): void;
        getRangeValue(): number;
        getOldRangeValue(): number;
        getRangeSize(): ResponsiveRange;
        getOldRangeSize(): ResponsiveRange;
        isInRange(range: ResponsiveRange): boolean;
        isInRangeOrSmaller(range: ResponsiveRange): boolean;
        isInRangeOrBigger(range: ResponsiveRange): boolean;
    }
}
declare module api.ui.responsive {
    class ResponsiveListener {
        private item;
        private listener;
        constructor(item: ResponsiveItem, listener: (event?: Event) => void);
        getItem(): ResponsiveItem;
        getListener(): (event?: Event) => void;
    }
}
declare module api.ui.responsive {
    class ResponsiveManager {
        private static window;
        private static responsiveListeners;
        static onAvailableSizeChanged(el: api.dom.Element, handler?: (item: ResponsiveItem) => void): ResponsiveItem;
        private static updateItemOnShown(el, responsiveItem);
        static unAvailableSizeChanged(el: api.dom.Element): void;
        static unAvailableSizeChangedByItem(item: ResponsiveItem): void;
        static fireResizeEvent(): void;
        static getWindow(): api.dom.WindowDOM;
    }
}
declare module api.ui {
    class KeyHelper {
        static isNumber(event: KeyboardEvent): boolean;
        static isDash(event: KeyboardEvent): boolean;
        static isDel(event: KeyboardEvent): boolean;
        static isSpace(event: KeyboardEvent): boolean;
        static isBackspace(event: KeyboardEvent): boolean;
        static isColon(event: KeyboardEvent): boolean;
        static isComma(event: KeyboardEvent): boolean;
        static isDot(event: KeyboardEvent): boolean;
        static isArrowKey(event: KeyboardEvent): boolean;
        static isArrowLeftKey(event: KeyboardEvent): boolean;
        static isArrowUpKey(event: KeyboardEvent): boolean;
        static isArrowRightKey(event: KeyboardEvent): boolean;
        static isArrowDownKey(event: KeyboardEvent): boolean;
        static isControlKey(event: KeyboardEvent): boolean;
        static isShiftKey(event: KeyboardEvent): boolean;
        static isAltKey(event: KeyboardEvent): boolean;
        static isMetaKey(event: KeyboardEvent): boolean;
        static isTabKey(event: KeyboardEvent): boolean;
        static isModifierKey(event: KeyboardEvent): boolean;
        static isEscKey(event: KeyboardEvent): boolean;
        static isEnterKey(event: KeyboardEvent): boolean;
        static isSpaceKey(event: KeyboardEvent): boolean;
        static isApplyKey(event: KeyboardEvent): boolean;
    }
}
declare module api.ui {
    enum KeyBindingAction {
        KEYDOWN = 0,
        KEYUP = 1,
        KEYPRESS = 2,
    }
    class KeyBinding {
        private combination;
        private callback;
        private action;
        private global;
        constructor(combination: string, callback?: (e: ExtendedKeyboardEvent, combo: string) => any, action?: KeyBindingAction, global?: boolean);
        setCallback(func: (e: ExtendedKeyboardEvent, combo: string) => boolean): KeyBinding;
        setAction(value: KeyBindingAction): KeyBinding;
        setGlobal(global: boolean): KeyBinding;
        getCombination(): string;
        getCallback(): (e: ExtendedKeyboardEvent, combo: string) => boolean;
        getAction(): KeyBindingAction;
        isGlobal(): boolean;
        static newKeyBinding(combination: string): KeyBinding;
        static createMultiple(callback: (e: ExtendedKeyboardEvent, combo: string) => any, ...combinations: string[]): KeyBinding[];
    }
}
declare module api.ui {
    class KeyBindings {
        private static instanceCount;
        private static INSTANCE;
        private instance;
        private activeBindings;
        private shelves;
        private static debug;
        private helpKeyPressedListeners;
        static get(): KeyBindings;
        constructor();
        bindKeys(bindings: KeyBinding[]): void;
        bindKey(binding: KeyBinding): void;
        unbindKeys(bindings: KeyBinding[]): void;
        unbindKey(binding: KeyBinding): void;
        trigger(combination: string, action?: string): void;
        reset(): void;
        getActiveBindings(): KeyBinding[];
        shelveBindings(): void;
        unshelveBindings(): void;
        isActive(keyBinding: KeyBinding): boolean;
        private initializeHelpKey();
        onHelpKeyPressed(listener: (event: ExtendedKeyboardEvent) => void): void;
        unHelpKeyPressed(listener: () => void): void;
        private notifyHelpKeyPressed(e);
    }
}
declare module api.ui {
    class Mnemonic {
        private value;
        constructor(value: string);
        getValue(): string;
        toKeyBinding(callback?: (e: ExtendedKeyboardEvent, combo: string) => any): KeyBinding;
        underlineMnemonic(text: string): string;
    }
}
declare module api.ui {
    enum IconSize {
        SMALL = 0,
        MEDIUM = 1,
        LARGE = 2,
    }
    class Icon extends api.dom.IEl {
        constructor(iconClass: string, size?: IconSize);
    }
}
declare module api.ui {
    class FontIcon extends api.dom.DivEl {
        constructor(iconClass: string);
    }
}
declare module api.ui {
    class Action {
        private label;
        private title;
        private iconClass;
        private shortcut;
        private mnemonic;
        private enabled;
        private visible;
        protected forceExecute: boolean;
        private executionListeners;
        private propertyChangedListeners;
        private childActions;
        private parentAction;
        private sortOrder;
        private beforeExecuteListeners;
        private afterExecuteListeners;
        constructor(label?: string, shortcut?: string, global?: boolean);
        setTitle(title: string): void;
        getTitle(): string;
        setSortOrder(sortOrder: number): void;
        getSortOrder(): number;
        setChildActions(actions: Action[]): Action;
        hasChildActions(): boolean;
        hasParentAction(): boolean;
        getParentAction(): Action;
        getChildActions(): Action[];
        getLabel(): string;
        setLabel(value: string): void;
        isEnabled(): boolean;
        setEnabled(value: boolean): void;
        isVisible(): boolean;
        setVisible(value: boolean): void;
        getIconClass(): string;
        setIconClass(value: string): void;
        private notifyPropertyChanged();
        hasShortcut(): boolean;
        getShortcut(): KeyBinding;
        setMnemonic(value: string): void;
        hasMnemonic(): boolean;
        getMnemonic(): Mnemonic;
        execute(forceExecute?: boolean): void;
        onExecuted(listener: (action: Action) => wemQ.Promise<any> | void): Action;
        unExecuted(listener: (action: Action) => wemQ.Promise<any> | void): Action;
        onPropertyChanged(listener: (action: Action) => void): void;
        unPropertyChanged(listener: () => void): void;
        onBeforeExecute(listener: (action: Action) => void): void;
        unBeforeExecute(listener: () => void): void;
        private notifyBeforeExecute();
        onAfterExecute(listener: (action: Action) => void): void;
        unAfterExecute(listener: (action: Action) => void): void;
        private notifyAfterExecute();
        clearListeners(): void;
        getKeyBindings(): KeyBinding[];
        static getKeyBindings(actions: api.ui.Action[]): KeyBinding[];
    }
}
declare module api.ui {
    interface ActionContainer {
        getActions(): Action[];
    }
}
declare module api.ui {
    interface Closeable {
        close(checkCanClose?: boolean): any;
        canClose(): boolean;
        onClosed(handler: (event: any) => void): any;
        unClosed(handler: (event: any) => void): any;
    }
}
declare module api.ui {
    /**
     * An abstract class capable of viewing a given object.
     */
    class Viewer<OBJECT> extends api.dom.Element {
        private object;
        constructor(className?: string);
        doRender(): Q.Promise<boolean>;
        protected doLayout(object: OBJECT): void;
        setObject(object: OBJECT): void;
        getObject(): OBJECT;
        getPreferredHeight(): number;
        toString(): string;
    }
}
declare module api.ui {
    class Tooltip {
        static SIDE_TOP: string;
        static SIDE_RIGHT: string;
        static SIDE_BOTTOM: string;
        static SIDE_LEFT: string;
        static TRIGGER_HOVER: string;
        static TRIGGER_FOCUS: string;
        static TRIGGER_NONE: string;
        static MODE_STATIC: string;
        static MODE_GLOBAL_STATIC: string;
        static MODE_FOLLOW: string;
        private static multipleAllowed;
        private static instances;
        private tooltipEl;
        private timeoutTimer;
        private overListener;
        private outListener;
        private moveListener;
        private targetEl;
        private text;
        private contentEl;
        private showDelay;
        private hideTimeout;
        private trigger;
        private side;
        private mode;
        private active;
        constructor(target: api.dom.Element, text?: string, showDelay?: number, hideTimeout?: number);
        setActive(value: boolean): void;
        show(): void;
        hide(): void;
        isVisible(): boolean;
        showAfter(ms: number): Tooltip;
        showFor(ms: number): Tooltip;
        setText(text: string): Tooltip;
        getText(): string;
        setContent(content: api.dom.Element): Tooltip;
        getContent(): api.dom.Element;
        setHideTimeout(timeout: number): Tooltip;
        getHideTimeout(): number;
        setShowDelay(delay: number): Tooltip;
        getShowDelay(): number;
        setTrigger(trigger: string): Tooltip;
        getTrigger(): string;
        setSide(side: string): Tooltip;
        getSide(): string;
        setMode(mode: string): Tooltip;
        getMode(): string;
        private positionAtMouse(event);
        private positionByTarget();
        private startHideTimeout(ms?);
        private startShowDelay(ms?);
        private stopTimeout();
        private hideOnMouseOut();
        private getEventName(enter);
        static hideOtherInstances(thisToolTip?: Tooltip): void;
        static allowMultipleInstances(allow: boolean): void;
        static isMultipleInstancesAllowed(): boolean;
    }
}
declare module api.ui {
    class ProgressBar extends api.dom.DivEl {
        private progress;
        private label;
        private value;
        /**
         * Widget to display progress
         * @param value the initial value (defaults to 0)
         */
        constructor(value?: number, label?: string);
        setLabel(label: string): void;
        setValue(value: number): void;
        getValue(): number;
        isComplete(): boolean;
        /**
         * Normalizes any value to be in 0-1 interval
         * @param value value to normalize
         * @returns {number} normalized value
         */
        private normalizeValue(value);
        private isInt(value);
        private isIntAndInRangeOf100(value);
    }
}
declare module api.ui {
    interface ToggleSlideActions {
        turnOnAction: api.ui.Action;
        turnOffAction: api.ui.Action;
    }
    class ToggleSlide extends api.dom.DivEl {
        private actions;
        private isOn;
        private enabled;
        private slider;
        private holder;
        private onLabel;
        private offLabel;
        private animationDuration;
        private sliderOffset;
        private slideLeft;
        private slideRight;
        private disabledClass;
        constructor(actions: ToggleSlideActions);
        toggle(): void;
        turnOn(): void;
        private slideOn();
        turnOff(): void;
        private slideOff();
        isTurnedOn(): boolean;
        setEnabled(enabled: boolean): void;
        isEnabled(): boolean;
        private createMarkup();
        private calculateStyles();
        private setupAnimation();
    }
}
declare module api.ui {
    interface NavigationItem {
        getIndex(): number;
    }
}
declare module api.ui {
    class NavigatorEvent {
        private tab;
        constructor(tab: NavigationItem);
        getItem(): NavigationItem;
    }
}
declare module api.ui {
    interface Navigator {
        insertNavigationItem(item: NavigationItem, index: number): any;
        addNavigationItem(item: NavigationItem): any;
        removeNavigationItem(item: NavigationItem): any;
        getNavigationItem(index: number): NavigationItem;
        selectNavigationItem(index: number, silent?: boolean): any;
        getSelectedNavigationItem(): NavigationItem;
        getSelectedIndex(): number;
        deselectNavigationItem(): any;
        getSize(): number;
        getNavigationItems(): NavigationItem[];
        onNavigationItemAdded(listener: (event: NavigatorEvent) => void): any;
        onNavigationItemSelected(listener: (event: NavigatorEvent) => void): any;
        onNavigationItemDeselected(listener: (event: NavigatorEvent) => void): any;
        unNavigationItemAdded(listener: (event: NavigatorEvent) => void): any;
        unNavigationItemSelected(listener: (event: NavigatorEvent) => void): any;
        unNavigationItemDeselected(listener: (event: NavigatorEvent) => void): any;
    }
}
declare module api.ui {
    class Dropdown extends api.dom.SelectEl {
        constructor(name: string);
        addOption(value: string, displayName: string): void;
    }
    class DropdownOption extends api.dom.OptionEl {
        constructor(value: string, displayName: string);
    }
}
declare module api.ui {
    enum RadioOrientation {
        VERTICAL = 0,
        HORIZONTAL = 1,
    }
    class RadioGroup extends api.dom.FormInputEl {
        private groupName;
        private options;
        constructor(name: string, originalValue?: string);
        setOrientation(orientation: RadioOrientation): RadioGroup;
        addOption(value: string, label: string): void;
        doSetValue(value: string, silent?: boolean): RadioGroup;
        doGetValue(): string;
        giveFocus(): boolean;
    }
    class RadioButton extends api.dom.FormInputEl {
        private radio;
        private label;
        static debug: boolean;
        constructor(label: string, value: string, name: string, checked?: boolean);
        setValue(value: string): RadioButton;
        getValue(): string;
        protected doSetValue(value: string, silent?: boolean): void;
        protected doGetValue(): string;
        setLabel(text: string): RadioButton;
        getLabel(): string;
        getName(): string;
        isChecked(): boolean;
        setChecked(checked: boolean, silent?: boolean): RadioButton;
        giveFocus(): boolean;
    }
}
declare module api.ui {
    class Checkbox extends api.dom.FormInputEl {
        private checkbox;
        private label;
        static debug: boolean;
        constructor(builder: CheckboxBuilder);
        isDisabled(): boolean;
        private initCheckbox(inputAlignment);
        private initLabel(text);
        private getInputAlignmentAsString(inputAlignment?);
        setChecked(newValue: boolean, silent?: boolean): Checkbox;
        isChecked(): boolean;
        toggleChecked(): void;
        protected doSetValue(value: string, silent?: boolean): void;
        protected doGetValue(): string;
        setValue(value: string, silent?: boolean): Checkbox;
        getValue(): string;
        giveFocus(): boolean;
        giveBlur(): boolean;
        setName(value: string): Checkbox;
        setPartial(value: boolean): void;
        isPartial(): boolean;
        setDisabled(value: boolean, cls?: string): Checkbox;
        setLabel(text: string): Checkbox;
        getLabel(): string;
        setPlaceholder(value: string): Checkbox;
        getPlaceholder(): string;
        static create(): CheckboxBuilder;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
    enum InputAlignment {
        TOP = 0,
        RIGHT = 1,
        LEFT = 2,
        BOTTOM = 3,
    }
    class CheckboxBuilder {
        text: string;
        checked: boolean;
        inputAlignment: InputAlignment;
        setLabelText(value: string): CheckboxBuilder;
        setChecked(value: boolean): CheckboxBuilder;
        setInputAlignment(value: InputAlignment): CheckboxBuilder;
        build(): Checkbox;
    }
}
declare module api.ui {
    class DragHelper extends api.dom.DivEl {
        static CURSOR_AT: {
            left: number;
            top: number;
        };
        private static instance;
        static debug: boolean;
        static get(): DragHelper;
        constructor();
        setDropAllowed(allowed: boolean): DragHelper;
        setItemName(itemName: string): void;
        isDropAllowed(): boolean;
        reset(): DragHelper;
    }
}
declare module api.ui {
    /**
     * A parent class capable of viewing a given object with names and icon.
     */
    class NamesAndIconViewer<OBJECT> extends api.ui.Viewer<OBJECT> {
        static EMPTY_DISPLAY_NAME: string;
        private namesAndIconView;
        private relativePath;
        private size;
        static debug: boolean;
        constructor(className?: string, size?: api.app.NamesAndIconViewSize);
        setObject(object: OBJECT, relativePath?: boolean): void;
        doLayout(object: OBJECT): void;
        private normalizeDisplayName(displayName);
        resolveDisplayName(object: OBJECT): string;
        resolveUnnamedDisplayName(object: OBJECT): string;
        resolveSubName(object: OBJECT, relativePath?: boolean): string;
        resolveSubTitle(object: OBJECT): string;
        resolveIconClass(object: OBJECT): string;
        resolveIconUrl(object: OBJECT): string;
        resolveIconEl(object: OBJECT): api.dom.Element;
        getPreferredHeight(): number;
        getNamesAndIconView(): api.app.NamesAndIconView;
    }
}
declare module api.ui {
    class ActivatedEvent {
        private index;
        constructor(index: number);
        getIndex(): number;
    }
}
declare module api.ui {
    import InputTypeView = api.form.inputtype.InputTypeView;
    class FocusSwitchEvent extends api.event.Event {
        private inputTypeView;
        constructor(inputTypeView: InputTypeView<any>);
        getInputTypeView(): InputTypeView<any>;
        static on(handler: (event: FocusSwitchEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: FocusSwitchEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.ui.menu {
    class Menu extends api.dom.UlEl {
        private menuItems;
        private hideOnItemClick;
        private itemClickListeners;
        constructor(actions?: api.ui.Action[]);
        isHideOnItemClick(): boolean;
        getMenuItems(): MenuItem[];
        addAction(action: api.ui.Action): Menu;
        addActions(actions: api.ui.Action[]): Menu;
        removeAction(action: api.ui.Action): Menu;
        removeActions(actions: api.ui.Action[]): Menu;
        setActions(actions: api.ui.Action[]): Menu;
        setHideOnItemClick(hide: boolean): Menu;
        onItemClicked(listener: (item: MenuItem) => void): void;
        unItemClicked(listener: (item: MenuItem) => void): void;
        private notifyItemClicked(item);
        private createMenuItem(action);
        private removeMenuItem(menuItem);
        getMenuItem(action: api.ui.Action): MenuItem;
    }
}
declare module api.ui.menu {
    class MenuItem extends api.dom.LiEl {
        private action;
        constructor(action: api.ui.Action);
        setLabel(label: string): void;
        getAction(): api.ui.Action;
        setEnabled(value: boolean): void;
        isEnabled(): boolean;
    }
}
declare module api.ui.menu {
    class ContextMenu extends Menu {
        constructor(actions?: api.ui.Action[], appendToBody?: boolean);
        showAt(x: number, y: number): void;
        moveBy(dx: number, dy: number): void;
        doMoveTo(menu: ContextMenu, x: number, y: number): void;
        private hideMenuOnOutsideClick(evt);
    }
}
declare module api.ui.menu {
    class ActionMenuItem extends api.dom.LiEl {
        private action;
        constructor(action: api.ui.Action);
        private updateVisibilityState();
    }
}
declare module api.ui.menu {
    class ActionMenu extends api.dom.DivEl {
        private actionListEl;
        private labelEl;
        constructor(label: string, ...actions: Action[]);
        setLabel(label: string): void;
        addAction(action: Action): void;
        private foldMenuOnOutsideClick(evt);
    }
}
declare module api.ui.menu {
    class TreeContextMenu extends api.dom.DlEl {
        private itemClickListeners;
        private actions;
        constructor(actions?: api.ui.Action[], appendToBody?: boolean);
        private addAction(action);
        addActions(actions: api.ui.Action[]): TreeContextMenu;
        setActions(actions: api.ui.Action[]): TreeContextMenu;
        clearActionListeners(): void;
        onItemClicked(listener: () => void): void;
        unItemClicked(listener: () => void): void;
        private notifyItemClicked();
        onBeforeAction(listener: (action: api.ui.Action) => void): void;
        onAfterAction(listener: (action: api.ui.Action) => void): void;
        showAt(x: number, y: number): void;
        moveBy(dx: number, dy: number): void;
        private doMoveTo(menu, x, y);
        private createMenuItem(action);
        private hideMenuOnOutsideClick(evt);
    }
}
declare module api.ui.menu {
    class TreeMenuItem extends api.dom.DdDtEl {
        private action;
        constructor(action: api.ui.Action, cls?: string, expanded?: boolean);
        toggleExpand(): void;
        private getCls(action, cls?, expanded?);
        getAction(): api.ui.Action;
        setEnabled(value: boolean): void;
    }
}
declare module api.ui.button {
    class Button extends api.dom.ButtonEl {
        private labelEl;
        constructor(label?: string);
        setEnabled(value: boolean): Button;
        isEnabled(): boolean;
        setLabel(label: string, escapeHtml?: boolean): Button;
        getLabel(): string;
        setTitle(title: string, forceAction?: boolean): void;
    }
}
declare module api.ui.button {
    class ActionButton extends api.ui.button.Button {
        private action;
        private tooltip;
        constructor(action: Action, showTooltip?: boolean);
        getAction(): Action;
        getTooltip(): Tooltip;
        private createLabel(action);
    }
}
declare module api.ui.button {
    class CycleButton extends api.ui.button.Button {
        private actionList;
        private active;
        constructor(actions: Action[]);
        private doAction();
        private removeAndHdeTitle();
        private setAndShowTitle();
        private updateActive();
        executePrevAction(): void;
        selectActiveAction(action: Action): void;
    }
}
declare module api.ui.button {
    class CloseButton extends api.ui.button.Button {
        constructor(className?: string);
    }
}
declare module api.ui.button {
    class TogglerButton extends api.ui.button.Button {
        private activeListeners;
        constructor(className?: string, title?: string);
        setActive(value: boolean): void;
        setVisible(value: boolean): TogglerButton;
        isActive(): boolean;
        onActiveChanged(listener: (isActive: boolean) => void): void;
        unActiveChanged(listener: (isActive: boolean) => void): void;
        private notifyActiveChanged(isActive);
    }
}
declare module api.ui.button {
    class DropdownHandle extends api.dom.ButtonEl {
        constructor();
        setEnabled(value: boolean): void;
        isEnabled(): boolean;
        down(): void;
        up(): void;
    }
}
declare module api.ui.button {
    import MenuItem = api.ui.menu.MenuItem;
    class MenuButton extends api.dom.DivEl {
        private dropdownHandle;
        private actionButton;
        private menu;
        constructor(mainAction: Action, menuActions?: Action[]);
        private initDropdownHandle();
        private initActionButton(action);
        getActionButton(): ActionButton;
        getMenuItem(action: api.ui.Action): MenuItem;
        getDropdownHandle(): DropdownHandle;
        private initMenu(actions);
        private getMenuActions();
        private updateActionEnabled();
        private initListeners();
        private hideMenu(event);
        setDropdownHandleEnabled(enabled?: boolean): void;
        hideDropdown(hidden?: boolean): void;
        minimize(): void;
        maximize(): void;
        setEnabled(enable: boolean): void;
    }
}
declare module api.ui.text {
    class TextInput extends api.dom.InputEl {
        static MIDDLE: string;
        static LARGE: string;
        /**
         * Specifies RegExp for characters that will be removed during input.
         */
        private stripCharsRe;
        /**
         * Forbidden chars filters out keyCodes for delete, backspace and arrow buttons in Firefox, so we need to
         * allow these to pass the filter (8=backspace, 9=tab, 46=delete, 39=right arrow, 47=left arrow)
         */
        private allowedKeyCodes;
        private previousValue;
        constructor(className?: string, size?: string, originalValue?: string);
        private setPreviousValue();
        static large(className?: string, originalValue?: string): TextInput;
        static middle(className?: string, originalValue?: string): TextInput;
        protected doSetValue(value: string, silent?: boolean): void;
        setForbiddenCharsRe(re: RegExp): TextInput;
        selectText(from?: number, to?: number): void;
        disableAutocomplete(): TextInput;
        moveCaretTo(pos: number): void;
        updateValidationStatusOnUserInput(isValid: boolean): void;
        private removeForbiddenChars(rawValue);
        private containsForbiddenChars(value);
        private keyCodeAllowed(keyCode);
    }
}
declare module api.ui.text {
    class AutosizeTextInput extends TextInput {
        private attendant;
        private clone;
        constructor(className?: string, size?: string, originalValue?: string);
        static large(className?: string, originalValue?: string): AutosizeTextInput;
        static middle(className?: string, originalValue?: string): AutosizeTextInput;
        private updateSize();
    }
}
declare module api.ui.text {
    class PasswordInput extends api.dom.InputEl {
        constructor(className?: string);
    }
}
declare module api.ui.text {
    class TextArea extends api.dom.FormInputEl {
        private attendant;
        private clone;
        constructor(name: string, originalValue?: string);
        setRows(rows: number): void;
        setColumns(columns: number): void;
        private updateSize();
        setReadOnly(readOnly: boolean): void;
    }
}
declare module api.ui.text {
    class CodeAreaBuilder {
        name: string;
        mode: string;
        value: string;
        lineNumbers: boolean;
        setName(value: string): CodeAreaBuilder;
        setMode(value: string): CodeAreaBuilder;
        setValue(value: string): CodeAreaBuilder;
        setLineNumbers(value: boolean): CodeAreaBuilder;
        build(): CodeArea;
    }
    class CodeArea extends api.dom.CompositeFormInputEl {
        private textArea;
        private options;
        private codeMirror;
        private mode;
        constructor(builder: CodeAreaBuilder);
    }
}
declare module api.ui.text {
    class PasswordGenerator extends api.dom.FormInputEl {
        private input;
        private showLink;
        private generateLink;
        private complexity;
        private focusListeners;
        private blurListeners;
        private SPECIAL_CHARS;
        private LOWERCASE_CHARS;
        private UPPERCASE_CHARS;
        private DIGIT_CHARS;
        constructor();
        doGetValue(): string;
        doSetValue(value: string, silent?: boolean): PasswordGenerator;
        getName(): string;
        setName(value: string): PasswordGenerator;
        setPlaceholder(value: string): PasswordGenerator;
        getPlaceholder(): string;
        private assessComplexity(value);
        private generatePassword();
        private isWeak(value);
        private isGood(value);
        private isStrong(value);
        private isExtreme(value);
        private containsDigits(value);
        private containsSpecialChars(value);
        private containsNonAlphabetChars(value);
        private initFocusEvents(el);
        onInput(listener: (event: Event) => void): void;
        unInput(listener: (event: Event) => void): void;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        private notifyFocused(event);
        private notifyBlurred(event);
    }
}
declare module api.ui.text {
    import InputEl = api.dom.InputEl;
    class EmailInput extends api.dom.CompositeFormInputEl {
        private input;
        private originEmail;
        private status;
        private checkTimeout;
        private userStoreKey;
        private focusListeners;
        private blurListeners;
        constructor();
        createInput(): InputEl;
        getInput(): InputEl;
        doSetValue(value: string, silent?: boolean): EmailInput;
        getOriginEmail(): string;
        setOriginEmail(value: string): EmailInput;
        setUserStoreKey(userStoreKey: api.security.UserStoreKey): EmailInput;
        isAvailable(): boolean;
        private checkAvailability(email);
        private updateStatus(status?);
        isValid(): boolean;
        validate(): boolean;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        private notifyFocused(event);
        private notifyBlurred(event);
    }
}
declare module api.ui.text {
    import Content = api.content.Content;
    import FileUploadStartedEvent = api.ui.uploader.FileUploadStartedEvent;
    import FileUploadProgressEvent = api.ui.uploader.FileUploadProgressEvent;
    import FileUploadedEvent = api.ui.uploader.FileUploadedEvent;
    import FileUploadCompleteEvent = api.ui.uploader.FileUploadCompleteEvent;
    import FileUploadFailedEvent = api.ui.uploader.FileUploadFailedEvent;
    class FileInput extends api.dom.CompositeFormInputEl {
        private textInput;
        private mediaUploaderEl;
        constructor(className?: string, originalValue?: string);
        private createMediaUploaderEl(originalValue?);
        setUploaderParams(params: {
            [key: string]: any;
        }): FileInput;
        getUploaderParams(): {
            [key: string]: string;
        };
        setPlaceholder(placeholder: string): FileInput;
        getPlaceholder(): string;
        reset(): FileInput;
        stop(): FileInput;
        enable(): void;
        disable(): void;
        getUploader(): api.ui.uploader.MediaUploaderEl;
        onUploadStarted(listener: (event: FileUploadStartedEvent<Content>) => void): void;
        unUploadStarted(listener: (event: FileUploadStartedEvent<Content>) => void): void;
        onUploadProgress(listener: (event: FileUploadProgressEvent<Content>) => void): void;
        unUploadProgress(listener: (event: FileUploadProgressEvent<Content>) => void): void;
        onFileUploaded(listener: (event: FileUploadedEvent<Content>) => void): void;
        unFileUploaded(listener: (event: FileUploadedEvent<Content>) => void): void;
        onUploadCompleted(listener: (event: FileUploadCompleteEvent<Content>) => void): void;
        unUploadCompleted(listener: (event: FileUploadCompleteEvent<Content>) => void): void;
        onUploadReset(listener: () => void): void;
        unUploadReset(listener: () => void): void;
        onUploadFailed(listener: (event: FileUploadFailedEvent<Content>) => void): void;
        unUploadFailed(listener: (event: FileUploadFailedEvent<Content>) => void): void;
    }
}
declare module api.ui.tab {
    class TabItem extends api.dom.LiEl implements api.ui.NavigationItem {
        private index;
        private label;
        private labelEl;
        private active;
        private closeAction;
        private removeButton;
        private labelChangedListeners;
        private closedListeners;
        private selectedListeners;
        constructor(builder: TabItemBuilder, classes?: string);
        private createRemoveButton();
        select(): void;
        setIndex(value: number): void;
        getIndex(): number;
        setLabel(newValue: string, markUnnamed?: boolean, addLabelTitleAttribute?: boolean): void;
        markInvalid(markInvalid?: boolean): void;
        getLabel(): string;
        setActive(value: boolean): void;
        isActive(): boolean;
        getCloseAction(): api.ui.Action;
        setCloseAction(closeAction: api.ui.Action): void;
        onLabelChanged(listener: (event: TabItemLabelChangedEvent) => void): void;
        onSelected(listener: (event: TabItemSelectedEvent) => void): void;
        onClosed(listener: (event: TabItemClosedEvent) => void): void;
        unLabelChanged(listener: (event: TabItemLabelChangedEvent) => void): void;
        unSelected(listener: (event: TabItemSelectedEvent) => void): void;
        unClosed(listener: (event: TabItemClosedEvent) => void): void;
        private notifyLabelChangedListeners(newValue, oldValue);
        private notifySelectedListeners();
        private notifyClosedListeners();
        giveFocus(): boolean;
        private setFocusable(focusable);
    }
    class TabItemBuilder {
        label: string;
        addLabelTitleAttribute: boolean;
        closeAction: api.ui.Action;
        closeButtonEnabled: boolean;
        markUnnamed: boolean;
        markInvalid: boolean;
        focusable: boolean;
        setLabel(label: string): TabItemBuilder;
        setCloseAction(closeAction: api.ui.Action): TabItemBuilder;
        setCloseButtonEnabled(enabled: boolean): TabItemBuilder;
        setMarkUnnamed(markUnnamed: boolean): TabItemBuilder;
        setMarkInvalid(markInvalid: boolean): TabItemBuilder;
        setAddLabelTitleAttribute(addLabelTitleAttribute: boolean): TabItemBuilder;
        setFocusable(focusable: boolean): TabItemBuilder;
        build(): TabItem;
    }
}
declare module api.ui.tab {
    class TabBar extends api.dom.UlEl implements api.ui.Navigator {
        private scrollEnabled;
        private tabs;
        private selectedIndex;
        private navigationItemAddedListeners;
        private navigationItemSelectedListeners;
        private navigationItemActivatedListeners;
        constructor(classes?: string);
        setScrollEnabled(enabled: boolean): void;
        insertNavigationItem(tab: TabBarItem, index: number, silent?: boolean): void;
        addNavigationItem(tab: TabBarItem, silent?: boolean): void;
        removeNavigationItem(tab: TabBarItem): void;
        selectNavigationItem(index: number, silent?: boolean, forced?: boolean): void;
        deselectNavigationItem(): void;
        getNavigationItem(index: number): TabBarItem;
        getSelectedNavigationItem(): TabBarItem;
        getSelectedIndex(): number;
        getSize(): number;
        isEmpty(): boolean;
        getNavigationItems(): TabBarItem[];
        onNavigationItemAdded(listener: (event: NavigatorEvent) => void): void;
        onNavigationItemSelected(listener: (event: NavigatorEvent) => void): void;
        onNavigationItemDeselected(listener: (event: NavigatorEvent) => void): void;
        onNavigationItemActivated(listener: (event: ActivatedEvent) => void): void;
        unNavigationItemAdded(listener: (event: NavigatorEvent) => void): void;
        unNavigationItemSelected(listener: (event: NavigatorEvent) => void): void;
        unNavigationItemDeselected(listener: (event: NavigatorEvent) => void): void;
        unNavigationItemActivated(listener: (event: ActivatedEvent) => void): void;
        private notifyTabAddedListeners(tab);
        private notifyTabSelectedListeners(tab);
        private notifyTabActivatedListeners(index);
    }
}
declare module api.ui.tab {
    class TabBarItem extends TabItem {
        constructor(builder: TabBarItemBuilder);
    }
    class TabBarItemBuilder extends TabItemBuilder {
        build(): TabBarItem;
    }
}
declare module api.ui.tab {
    class TabMenu extends api.dom.DivEl implements api.ui.Navigator {
        private tabMenuButton;
        private menuEl;
        private menuVisible;
        private tabs;
        private selectedTab;
        private hideOnItemClick;
        private navigationItemAddedListeners;
        private navigationItemRemovedListeners;
        private navigationItemSelectedListeners;
        private navigationItemDeselectedListeners;
        private enabled;
        private focusIndex;
        constructor(className?: string);
        private initTabMenuButton();
        private initListeners();
        isEnabled(): boolean;
        giveFocusToMenu(): boolean;
        returnFocusFromMenu(): boolean;
        focusNextTab(): boolean;
        focusPreviousTab(): boolean;
        isKeyNext(event: KeyboardEvent): boolean;
        isKeyPrevious(event: KeyboardEvent): void;
        setEnabled(enabled: boolean): TabMenu;
        protected createTabMenuButton(): TabMenuButton;
        protected setButtonLabel(value: string): TabMenu;
        protected handleClick(e: MouseEvent): void;
        setButtonClass(cls: string): TabMenu;
        setHideOnItemClick(hide: boolean): TabMenu;
        getTabMenuButtonEl(): TabMenuButton;
        getMenuEl(): api.dom.UlEl;
        private toggleMenu();
        protected hideMenu(): void;
        protected showMenu(): void;
        isMenuVisible(): boolean;
        insertNavigationItem(tab: TabMenuItem, index: number): void;
        addNavigationItem(tab: TabMenuItem): void;
        prependNavigationItem(tab: TabMenuItem): void;
        private initializeNewItemEvents(tab);
        isEmpty(): boolean;
        getSize(): number;
        countVisible(): number;
        getSelectedNavigationItem(): TabMenuItem;
        getSelectedIndex(): number;
        getNavigationItem(tabIndex: number): TabMenuItem;
        getNavigationItems(): TabMenuItem[];
        removeNavigationItem(tab: TabMenuItem): void;
        removeNavigationItems(): void;
        resetItemsVisibility(): void;
        updateActiveTab(tabIndex: number): void;
        selectNavigationItem(tabIndex: number): void;
        deselectNavigationItem(): void;
        onNavigationItemAdded(listener: (event: NavigatorEvent) => void): void;
        onNavigationItemRemoved(listener: (event: NavigatorEvent) => void): void;
        onNavigationItemSelected(listener: (event: NavigatorEvent) => void): void;
        onNavigationItemDeselected(listener: (event: NavigatorEvent) => void): void;
        unNavigationItemAdded(listener: (event: NavigatorEvent) => void): void;
        unNavigationItemRemoved(listener: (event: NavigatorEvent) => void): void;
        unNavigationItemSelected(listener: (event: NavigatorEvent) => void): void;
        unNavigationItemDeselected(listener: (event: NavigatorEvent) => void): void;
        private notifyTabAddedListeners(tab);
        private notifyTabRemovedListeners(tab);
        private notifyTabSelectedListeners(tab);
        private notifyTabDeselectedListeners(tab);
    }
}
declare module api.ui.tab {
    class TabMenuButton extends api.dom.DivEl {
        private labelEl;
        constructor();
        setLabel(value: string, addTitle?: boolean): void;
        getLabel(): api.dom.AEl;
        focus(): boolean;
    }
}
declare module api.ui.tab {
    class TabMenuItem extends TabItem {
        private visibleInMenu;
        constructor(builder: TabMenuItemBuilder);
        isVisibleInMenu(): boolean;
        setVisibleInMenu(value: boolean): void;
        static create(): TabMenuItemBuilder;
    }
    class TabMenuItemBuilder extends TabItemBuilder {
        build(): TabMenuItem;
        setLabel(label: string): TabMenuItemBuilder;
        setAddLabelTitleAttribute(addLabelTitleAttribute: boolean): TabMenuItemBuilder;
    }
}
declare module api.ui.tab {
    class TabItemEvent {
        private tab;
        constructor(tab: TabItem);
        getTab(): TabItem;
    }
}
declare module api.ui.tab {
    class TabItemClosedEvent extends TabItemEvent {
        constructor(tab: TabItem);
    }
}
declare module api.ui.tab {
    class TabItemLabelChangedEvent extends TabItemEvent {
        private oldValue;
        private newValue;
        constructor(tab: TabItem, oldValue: string, newValue: string);
        getOldValue(): string;
        getNewValue(): string;
    }
}
declare module api.ui.tab {
    class TabItemSelectedEvent extends TabItemEvent {
        constructor(tab: TabItem);
    }
}
declare module api.ui.tab {
    class HideTabMenuEvent extends api.event.Event {
        tabMenu: TabMenu;
        constructor(tabMenu: TabMenu);
        getTabMenu(): TabMenu;
        static on(handler: (event: HideTabMenuEvent) => void): void;
        static un(handler?: (event: HideTabMenuEvent) => void): void;
    }
}
declare module api.ui.uploader {
    class UploadItem<MODEL extends api.Equitable> implements api.Equitable {
        private file;
        private model;
        private fileName;
        private failedListeners;
        private uploadStoppedListeners;
        private uploadListeners;
        private progressListeners;
        constructor(file: FineUploaderFile);
        getId(): string;
        getModel(): MODEL;
        setModel(model: MODEL): UploadItem<MODEL>;
        getName(): string;
        setName(name: string): UploadItem<MODEL>;
        getSize(): number;
        setSize(size: number): UploadItem<MODEL>;
        getProgress(): number;
        setProgress(progress: number): UploadItem<MODEL>;
        getStatus(): string;
        setStatus(status: string): UploadItem<MODEL>;
        equals(o: api.Equitable): boolean;
        isUploaded(): boolean;
        onProgress(listener: (progress: number) => void): void;
        unProgress(listener: (progress: number) => void): void;
        private notifyProgress(progress);
        onUploaded(listener: (model: MODEL) => void): void;
        unUploaded(listener: (model: MODEL) => void): void;
        private notifyUploaded(model);
        onFailed(listener: () => void): void;
        unFailed(listener: () => void): void;
        notifyFailed(): void;
        onUploadStopped(listener: () => void): void;
        unUploadStopped(listener: () => void): void;
        notifyUploadStopped(): void;
    }
}
declare module api.ui.uploader {
    class FileUploadStartedEvent<ITEM extends api.Equitable> {
        private uploadItems;
        constructor(uploadItems: UploadItem<ITEM>[]);
        getUploadItems(): UploadItem<ITEM>[];
    }
}
declare module api.ui.uploader {
    class FileUploadProgressEvent<MODEL extends api.Equitable> {
        private uploadItem;
        constructor(uploadItem: UploadItem<MODEL>);
        getUploadItem(): UploadItem<MODEL>;
    }
}
declare module api.ui.uploader {
    class FileUploadedEvent<ITEM extends api.Equitable> {
        private uploadItem;
        constructor(uploadItem: UploadItem<ITEM>);
        getUploadItem(): UploadItem<ITEM>;
    }
}
declare module api.ui.uploader {
    class FileUploadCompleteEvent<ITEM extends api.Equitable> {
        private uploadItems;
        constructor(uploadItems: UploadItem<ITEM>[]);
        getUploadItems(): UploadItem<ITEM>[];
    }
}
declare module api.ui.uploader {
    class FileUploadFailedEvent<ITEM extends api.Equitable> {
        private uploadItem;
        constructor(uploadItem: UploadItem<ITEM>);
        getUploadItem(): UploadItem<ITEM>;
    }
}
declare var qq: any;
declare module api.ui.uploader {
    import Element = api.dom.Element;
    interface FineUploaderFile {
        id: number;
        name: string;
        size: number;
        uuid: string;
        status: string;
        percent: number;
    }
    interface UploaderElConfig {
        name: string;
        url?: string;
        hasUploadButton?: boolean;
        allowDrop?: boolean;
        selfIsDropzone?: boolean;
        resultAlwaysVisisble?: boolean;
        allowTypes?: {
            title: string;
            extensions: string;
        }[];
        allowMultiSelection?: boolean;
        showCancel?: boolean;
        showResult?: boolean;
        maximumOccurrences?: number;
        deferred?: boolean;
        params?: {
            [key: string]: any;
        };
        value?: string;
        disabled?: boolean;
        hideDefaultDropZone?: boolean;
    }
    class UploaderEl<MODEL extends api.Equitable> extends api.dom.FormInputEl {
        protected config: UploaderElConfig;
        protected uploader: any;
        protected dragAndDropper: any;
        protected value: string;
        private uploadedItems;
        private extraDropzoneIds;
        private defaultDropzoneContainer;
        protected dropzone: api.dom.AEl;
        private uploadButton;
        private progress;
        private cancelBtn;
        private resultContainer;
        private uploadStartedListeners;
        private uploadProgressListeners;
        private fileUploadedListeners;
        private uploadCompleteListeners;
        private uploadFailedListeners;
        private uploadResetListeners;
        private dropzoneDragEnterListeners;
        private dropzoneDragLeaveListeners;
        private dropzoneDropListeners;
        private debouncedUploadStart;
        private shownInitHandler;
        private renderedInitHandler;
        static debug: boolean;
        constructor(config: UploaderElConfig);
        private initUploadButton();
        private initDebouncedUploadStart();
        private initDropzone();
        private initCancelButton();
        private handleKeyEvents();
        protected initHandler(): void;
        private destroyHandler();
        private initConfig(config);
        getName(): string;
        doGetValue(): string;
        doSetValue(value: string, silent?: boolean): UploaderEl<MODEL>;
        protected appendNewItems(newItemsToAppend: Element[]): void;
        protected removeAllChildrenExceptGiven(itemsToKeep: Element[]): void;
        protected refreshExistingItem(existingItem: Element, value: string): void;
        protected getExistingItem(value: string): Element;
        parseValues(jsonString: string): string[];
        createResultItem(value: string): api.dom.Element;
        setMaximumOccurrences(value: number): UploaderEl<MODEL>;
        stop(): UploaderEl<MODEL>;
        reset(): UploaderEl<MODEL>;
        protected getErrorMessage(fileString: string): string;
        setDefaultDropzoneVisible(visible?: boolean, isDrag?: boolean): void;
        setProgressVisible(visible?: boolean): void;
        setResultVisible(visible?: boolean): void;
        createModel(serverResponse: any): MODEL;
        getModelValue(item: MODEL): string;
        setParams(params: {
            [key: string]: any;
        }): UploaderEl<MODEL>;
        setEnabled(enabled: boolean): UploaderEl<MODEL>;
        isEnabled(): boolean;
        getParams(): {
            [key: string]: any;
        };
        getAllowedTypes(): {
            title: string;
            extensions: string;
        }[];
        private findUploadItemById(id);
        private submitCallback(id, name);
        private statusChangeCallback(id, oldStatus, newStatus);
        private progressCallback(id, name, uploadedBytes, totalBytes);
        private fileCompleteCallback(id, name, response, xhrOrXdr);
        private errorCallback(id, name, errorReason, xhrOrXdr);
        private allCompleteCallback();
        protected initUploader(): any;
        private getFileExtensions(allowTypes);
        addDropzone(id: string): void;
        private getDropzoneElements();
        private disableInputFocus();
        private startUpload();
        private finishUpload();
        private isUploading();
        getUploadButton(): api.dom.DivEl;
        hasUploadButton(): boolean;
        getResultContainer(): api.dom.DivEl;
        getDefaultDropzoneContainer(): api.dom.DivEl;
        getDropzone(): api.dom.AEl;
        showFileSelectionDialog(): void;
        onUploadStarted(listener: (event: FileUploadStartedEvent<MODEL>) => void): void;
        unUploadStarted(listener: (event: FileUploadStartedEvent<MODEL>) => void): void;
        onUploadProgress(listener: (event: FileUploadProgressEvent<MODEL>) => void): void;
        unUploadProgress(listener: (event: FileUploadProgressEvent<MODEL>) => void): void;
        onFileUploaded(listener: (event: FileUploadedEvent<MODEL>) => void): void;
        unFileUploaded(listener: (event: FileUploadedEvent<MODEL>) => void): void;
        onUploadCompleted(listener: (event: FileUploadCompleteEvent<MODEL>) => void): void;
        unUploadCompleted(listener: (event: FileUploadCompleteEvent<MODEL>) => void): void;
        onUploadReset(listener: () => void): void;
        unUploadReset(listener: () => void): void;
        onUploadFailed(listener: (event: FileUploadFailedEvent<MODEL>) => void): void;
        unUploadFailed(listener: (event: FileUploadFailedEvent<MODEL>) => void): void;
        onDropzoneDragEnter(listener: (event: DragEvent) => void): void;
        unDropzoneDragEnter(listener: (event: DragEvent) => void): void;
        onDropzoneDragLeave(listener: (event: DragEvent) => void): void;
        unDropzoneDragLeave(listener: (event: DragEvent) => void): void;
        onDropzoneDrop(listener: (event: DragEvent) => void): void;
        unDropzoneDragDrop(listener: (event: DragEvent) => void): void;
        private notifyDropzoneDragEnter(event);
        private notifyDropzoneDragLeave(event);
        private notifyDropzoneDrop(event);
        private notifyFileUploadStarted(uploadItems);
        private notifyFileUploadProgress(uploadItem);
        private notifyFileUploaded(uploadItem);
        private notifyUploadCompleted(uploadItems);
        private notifyUploadReset();
        private notifyUploadFailed(uploadItem);
    }
    class DropzoneContainer extends api.dom.DivEl {
        private dropzone;
        constructor(hasMask?: boolean);
        private initDropzone();
        getDropzone(): api.dom.AEl;
    }
}
declare module api.ui.uploader {
    enum MediaUploaderElOperation {
        create = 0,
        update = 1,
    }
    interface MediaUploaderElConfig extends api.ui.uploader.UploaderElConfig {
        operation: MediaUploaderElOperation;
    }
    class MediaUploaderEl extends api.ui.uploader.UploaderEl<api.content.Content> {
        private fileName;
        private link;
        constructor(config: MediaUploaderElConfig);
        createModel(serverResponse: api.content.json.ContentJson): api.content.Content;
        getModelValue(item: api.content.Content): string;
        getMediaValue(item: api.content.Content): api.data.Value;
        setFileName(name: string): void;
        createResultItem(value: string): api.dom.Element;
    }
}
declare module api.ui.uploader {
    class FileUploaderEl<MODEL extends api.Equitable> extends UploaderEl<MODEL> {
        protected contentId: string;
        static FILE_NAME_DELIMITER: string;
        doSetValue(value: string, silent?: boolean): UploaderEl<MODEL>;
        resetValues(value: string): void;
        setContentId(contentId: string): void;
        protected initHandler(): void;
        private refreshVisibility();
        private getItems(value);
    }
}
declare module api.ui.panel {
    /**
     * Use Panel when you need a container that needs 100% height.
     */
    class Panel extends api.dom.DivEl {
        private doOffset;
        constructor(className?: string);
        setDoOffset(value: boolean): void;
        doRender(): Q.Promise<boolean>;
        protected calculateOffset(): void;
        protected resolveActions(panel: api.ui.panel.Panel): api.ui.Action[];
    }
}
declare module api.ui.panel {
    class PanelShownEvent {
        private panel;
        private index;
        private previousPanel;
        constructor(panel: Panel, index: number, previousPanel: Panel);
        getPanel(): Panel;
        getIndex(): number;
        getPreviousPanel(): Panel;
    }
}
declare module api.ui.panel {
    /**
     * A panel having multiple child panels, but showing only one at a time - like a deck of cards.
     */
    class DeckPanel extends Panel {
        private panels;
        private panelShown;
        private panelShownListeners;
        constructor(className?: string);
        isEmpty(): boolean;
        getSize(): number;
        addPanel<T extends Panel>(panel: T): number;
        getPanel(index: number): Panel;
        getPanels(): Panel[];
        getLastPanel(): Panel;
        getPanelShown(): Panel;
        getPanelShownIndex(): number;
        getPanelIndex<T extends Panel>(panel: T): number;
        removePanelByIndex(index: number, checkCanRemovePanel?: boolean): Panel;
        removePanel(panelToRemove: Panel, checkCanRemovePanel?: boolean): number;
        canRemovePanel(panel: Panel): boolean;
        showPanel(panel: Panel): void;
        showPanelByIndex(index: number): void;
        onPanelShown(listener: (event: PanelShownEvent) => void): void;
        unPanelShown(listener: (event: PanelShownEvent) => void): void;
        private notifyPanelShown(panel, panelIndex, previousPanel);
    }
}
declare module api.ui.panel {
    class PanelStrip extends Panel {
        private panels;
        private headers;
        private scrollable;
        private offset;
        private panelShown;
        private panelShownListeners;
        constructor(scrollable?: api.dom.Element, className?: string);
        private countExistingChildren(index);
        insertPanel(panel: Panel, index: number, header?: string): number;
        getPanels(): Panel[];
        getScrollable(): api.dom.Element;
        setScrollOffset(offset: number): PanelStrip;
        getScrollOffset(): number;
        private updateLastPanelHeight();
        removePanel(panelToRemove: Panel, checkCanRemovePanel?: boolean): number;
        canRemovePanel(panel: Panel): boolean;
        isEmpty(): boolean;
        getSize(): number;
        getPanel(index: number): Panel;
        getHeader(index: number): api.dom.H2El;
        getPanelShown(): Panel;
        getPanelShownIndex(): number;
        getPanelIndex<T extends Panel>(panel: T): number;
        showPanel(panel: Panel): void;
        showPanelByIndex(index: number): void;
        getScroll(): number;
        setScroll(scrollTop: number): void;
        onPanelShown(listener: (event: PanelShownEvent) => void): void;
        unPanelShown(listener: (event: PanelShownEvent) => void): void;
        private notifyPanelShown(panel, panelIndex, previousPanel);
    }
}
declare module api.ui.panel {
    enum SplitPanelAlignment {
        HORIZONTAL = 0,
        VERTICAL = 1,
    }
    enum SplitPanelUnit {
        PIXEL = 0,
        PERCENT = 1,
    }
    class SplitPanelBuilder {
        private firstPanel;
        private secondPanel;
        private firstPanelSize;
        private firstPanelMinSize;
        private firstPanelUnit;
        private secondPanelSize;
        private secondPanelMinSize;
        private secondPanelUnit;
        private alignment;
        private alignmentTreshold;
        private animationDelay;
        private splitterThickness;
        private firstPanelIsDecidingPanel;
        private secondPanelShouldSlideRight;
        constructor(firstPanel: Panel, secondPanel: Panel);
        build(): SplitPanel;
        setFirstPanelSize(size: number, unit: SplitPanelUnit): SplitPanelBuilder;
        setFirstPanelMinSize(size: number, unit: SplitPanelUnit): SplitPanelBuilder;
        setSecondPanelSize(size: number, unit: SplitPanelUnit): SplitPanelBuilder;
        setSecondPanelMinSize(size: number, unit: SplitPanelUnit): SplitPanelBuilder;
        setAlignment(alignment: SplitPanelAlignment): SplitPanelBuilder;
        setAlignmentTreshold(treshold: number): SplitPanelBuilder;
        setAnimationDelay(value: number): SplitPanelBuilder;
        setSplitterThickness(thickness: number): SplitPanelBuilder;
        setSecondPanelShouldSlideRight(value: boolean): SplitPanelBuilder;
        getFirstPanel(): Panel;
        getFirstPanelMinSize(): number;
        getSecondPanel(): Panel;
        getSecondPanelMinSize(): number;
        getFirstPanelSize(): number;
        getSecondPanelSize(): number;
        getAlignment(): SplitPanelAlignment;
        getAlignmentTreshold(): number;
        getAnimationDelay(): number;
        getSplitterThickness(): number;
        getFirstPanelUnit(): SplitPanelUnit;
        getSecondPanelUnit(): SplitPanelUnit;
        isFirstPanelDecidingPanel(): boolean;
        isSecondPanelShouldSlideRight(): boolean;
    }
    class SplitPanel extends Panel {
        private firstPanel;
        private secondPanel;
        private firstPanelSize;
        private firstPanelMinSize;
        private firstPanelUnit;
        private secondPanelSize;
        private secondPanelMinSize;
        private secondPanelUnit;
        private splitterThickness;
        private splitter;
        private alignment;
        private alignmentTreshold;
        private ghostDragger;
        private dragListener;
        private mask;
        private splitterPosition;
        private firstPanelIsHidden;
        private firstPanelIsFullScreen;
        private secondPanelIsHidden;
        private hiddenFirstPanelPreviousSize;
        private hiddenSecondPanelPreviousSize;
        private splitterIsHidden;
        private savedFirstPanelSize;
        private savedFirstPanelMinSize;
        private savedFirstPanelUnit;
        private savedSecondPanelSize;
        private savedSecondPanelMinSize;
        private savedSecondPanelUnit;
        private animationDelay;
        private secondPanelShouldSlideRight;
        constructor(builder: SplitPanelBuilder);
        private onRenderedDragHandler();
        private startDrag();
        private stopDrag(e);
        private splitterWithinBoundaries(offset);
        private requiresAlignment();
        private updateAlignment();
        setFirstPanelSize(size: number, unit?: SplitPanelUnit): void;
        setFirstPanelIsFullScreen(fullScreen: boolean): void;
        setSecondPanelSize(size: number, unit?: SplitPanelUnit): void;
        savePanelSizes(): void;
        loadPanelSizes(): void;
        savePanelSizesAndDistribute(newFirstPanelSize: number, minSize?: number, unit?: SplitPanelUnit): void;
        loadPanelSizesAndDistribute(): void;
        appendChild<T extends api.dom.Element>(child: T): api.dom.Element;
        appendChildren<T extends api.dom.Element>(...children: T[]): api.dom.Element;
        prependChild(child: api.dom.Element): api.dom.Element;
        showSplitter(): void;
        hideSplitter(): void;
        distribute(): void;
        runWithAnimationDelayIfPresent(callee: () => void): void;
        isHorizontal(): boolean;
        getPanelSizeString(panelNumber: number): string;
        showFirstPanel(): void;
        showSecondPanel(showSplitter?: boolean): void;
        hideFirstPanel(): void;
        hideSecondPanel(): void;
        foldSecondPanel(): void;
        getActiveWidthPxOfSecondPanel(): number;
        setActiveWidthPxOfSecondPanel(value: number): void;
        isFirstPanelHidden(): boolean;
        isSecondPanelHidden(): boolean;
        private slideInSecondPanelFromRight();
        private slideOutSecondPanelRight();
        private getUnitString(panelNumber);
        private getSplitterThickness();
        toString(): string;
    }
}
declare module api.ui.panel {
    /**
     * A DeckPanel with NavigationItem-s.
     */
    class NavigatedDeckPanel extends DeckPanel {
        private navigator;
        constructor(navigator: Navigator);
        getSelectedNavigationItem(): NavigationItem;
        addNavigablePanel(item: NavigationItem, panel: Panel, select?: boolean): number;
        selectPanelByIndex(index: number): void;
    }
}
declare module api.ui.panel {
    class NavigatedPanelStrip extends PanelStrip {
        private navigator;
        private scrollIndex;
        private focusIndex;
        private focusVisible;
        private listenToScroll;
        constructor(navigator: Navigator, scrollable?: api.dom.Element, className?: string);
        setListenToScroll(listen?: boolean): void;
        private updateScrolledNavigationItem();
        private isFocusedPanelVisible(scrollTop);
        private getScrolledPanelIndex(scrollTop);
        getSelectedNavigationItem(): NavigationItem;
        insertNavigablePanel(item: NavigationItem, panel: Panel, header: string, index: number, select?: boolean): number;
        addNavigablePanel(item: NavigationItem, panel: Panel, header: string, select?: boolean): number;
        selectPanel(item: NavigationItem): void;
        selectPanelByIndex(index: number): void;
        removeNavigablePanel(panel: Panel, checkCanRemovePanel?: boolean): number;
        private getFocusedHeaderHeight(curStrip);
    }
}
declare module api.ui.panel {
    import TabBar = api.ui.tab.TabBar;
    class DockedPanel extends Panel {
        private deck;
        private navigator;
        private items;
        constructor();
        doRender(): Q.Promise<boolean>;
        addItem<T extends Panel>(label: string, addLabelTitleAttribute: boolean, panel: T, select?: boolean): number;
        selectPanel<T extends Panel>(panel: T): void;
        getNavigator(): TabBar;
        getDeck(): DeckPanel;
    }
}
declare module api.ui.dialog {
    class DialogButton extends api.ui.button.ActionButton {
        constructor(action: api.ui.Action);
    }
}
declare module api.ui.dialog {
    import DivEl = api.dom.DivEl;
    import Action = api.ui.Action;
    import Element = api.dom.Element;
    interface ConfirmationConfig {
        question?: string;
        yesCallback: () => void;
        noCallback?: () => void;
    }
    interface ModalDialogConfig {
        title?: string;
        buttonRow?: ButtonRow;
        confirmation?: ConfirmationConfig;
        closeIconCallback?: () => void;
    }
    class ModalDialog extends DivEl {
        protected header: api.ui.dialog.ModalDialogHeader;
        private contentPanel;
        private buttonRow;
        private cancelAction;
        protected closeIcon: DivEl;
        protected confirmationDialog: ConfirmationDialog;
        private static openDialogsCounter;
        private tabbable;
        private listOfClickIgnoredElements;
        private onClosedListeners;
        private closeIconCallback;
        static debug: boolean;
        constructor(config?: ModalDialogConfig);
        private initConfirmationDialog(confirmation);
        private initListeners();
        private isActive();
        private handleClickOutsideDialog();
        private handleFocusInOutEvents();
        protected createHeader(title: string): api.ui.dialog.ModalDialogHeader;
        addClickIgnoredElement(elem: api.dom.Element): void;
        private isIgnoredElementClicked(element);
        private createDefaultCancelAction();
        getCancelAction(): Action;
        addCancelButtonToBottom(buttonLabel?: string): DialogButton;
        setTitle(value: string): void;
        appendChildToContentPanel(child: api.dom.Element): void;
        prependChildToContentPanel(child: api.dom.Element): void;
        appendChildToHeader(child: api.dom.Element): void;
        prependChildToHeader(child: api.dom.Element): void;
        removeChildFromContentPanel(child: api.dom.Element): void;
        addAction(action: Action, useDefault?: boolean, prepend?: boolean): DialogButton;
        removeAction(actionButton: DialogButton): void;
        show(): void;
        hide(): void;
        protected centerMyself(): void;
        centerHorisontally(): void;
        getButtonRow(): ButtonRow;
        getContentPanel(): ModalDialogContentPanel;
        protected hasSubDialog(): boolean;
        private hasTabbable();
        updateTabbable(): void;
        private getTabbedIndex();
        private focusNextTabbable();
        private focusPreviousTabbable();
        open(): void;
        isDirty(): boolean;
        confirmBeforeClose(): void;
        close(): void;
        onClosed(onCloseCallback: () => void): void;
        unClosed(listener: {
            (): void;
        }): void;
        private notifyClosed();
    }
    class ModalDialogHeader extends DivEl {
        private titleEl;
        constructor(title: string);
        setTitle(value: string): void;
        appendElement(el: Element): void;
    }
    class ModalDialogContentPanel extends DivEl {
        constructor();
    }
    class ButtonRow extends DivEl {
        private defaultElement;
        private buttonContainer;
        private actions;
        constructor();
        addElement(element: Element): void;
        getActions(): Action[];
        addToActions(action: Action): void;
        addAction(action: Action, useDefault?: boolean, prepend?: boolean): DialogButton;
        removeAction(action: Action): void;
        setDefaultElement(element: api.dom.Element): void;
        resetDefaultElement(): void;
        focusDefaultAction(): void;
    }
}
declare module api.ui.dialog {
    class ConfirmationDialog extends ModalDialog {
        private questionEl;
        private yesCallback;
        private noCallback;
        private yesAction;
        private noAction;
        constructor(config?: ModalDialogConfig);
        setQuestion(question: string): ConfirmationDialog;
        setYesCallback(callback: () => void): ConfirmationDialog;
        setNoCallback(callback: () => void): ConfirmationDialog;
        open(): void;
        close(): void;
        private closeWithoutCallback();
    }
}
declare module api.ui.dialog {
    import MenuButton = api.ui.button.MenuButton;
    class DropdownButtonRow extends ButtonRow {
        protected actionMenu: MenuButton;
        constructor();
        makeActionMenu(mainAction: Action, menuActions: Action[], useDefault?: boolean): MenuButton;
        getActionMenu(): MenuButton;
    }
}
declare module api.ui.form {
    class Fieldset extends api.dom.FieldsetEl {
        private legend;
        private items;
        private focusListeners;
        private blurListeners;
        private validityChangedListeners;
        constructor(legend?: string);
        add(formItem: FormItem): void;
        removeItem(formItem: FormItem): void;
        validate(validationResult: ValidationResult, markInvalid?: boolean): void;
        setFieldsetData(data: any): void;
        getFieldsetData(): any;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        private notifyFocused(event);
        private notifyBlurred(event);
        onValidityChanged(listener: (event: ValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: ValidityChangedEvent) => void): void;
        notifyValidityChanged(valid: boolean): void;
    }
}
declare module api.ui.form {
    class Form extends api.dom.FormEl {
        private fieldsets;
        private focusListeners;
        private blurListeners;
        private validityChangedListeners;
        constructor(className?: string);
        add(fieldset: Fieldset): this;
        validate(markInvalid?: boolean): ValidationResult;
        setFormData(data: any): void;
        getFormData(): any;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        notifyFocused(event: FocusEvent): void;
        notifyBlurred(event: FocusEvent): void;
        onValidityChanged(listener: (event: ValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: ValidityChangedEvent) => void): void;
        notifyValidityChanged(valid: boolean): void;
    }
}
declare module api.ui.form {
    class FormItem extends api.dom.DivEl {
        private label;
        private input;
        private error;
        private validator;
        private invalidClass;
        private focusListeners;
        private blurListeners;
        constructor(builder: FormItemBuilder);
        setLabel(value: string): void;
        getLabel(): api.dom.LabelEl;
        getInput(): api.dom.FormItemEl;
        getValidator(): (input: api.dom.FormItemEl) => string;
        removeValidator(): void;
        setValidator(value: (input: api.dom.FormItemEl) => string): void;
        validate(validationResult: ValidationResult, markInvalid?: boolean): void;
        getError(): string;
        onValidityChanged(listener: (event: ValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: ValidityChangedEvent) => void): void;
        notifyValidityChanged(valid: boolean): void;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        private notifyFocused(event);
        private notifyBlurred(event);
    }
    class FormItemBuilder {
        private label;
        private validator;
        private input;
        constructor(input: api.dom.FormItemEl);
        build(): FormItem;
        getInput(): api.dom.FormItemEl;
        setLabel(label: string): FormItemBuilder;
        getLabel(): string;
        setValidator(validator: (input: api.dom.FormInputEl) => string): FormItemBuilder;
        getValidator(): (input: api.dom.FormInputEl) => string;
    }
}
declare module api.ui.form {
    class Validators {
        static required(input: api.dom.FormInputEl): string;
        static validEmail(input: api.dom.FormInputEl): string;
    }
}
declare module api.ui.form {
    class ValidationResult {
        private valid;
        private errors;
        addError(error: ValidationError): void;
        isValid(): boolean;
        getErrors(): ValidationError[];
    }
    class ValidationError {
        private formItem;
        private message;
        constructor(formItem: api.ui.form.FormItem, message?: string);
        getFormItem(): api.ui.form.FormItem;
        getMessage(): string;
    }
}
declare module api.ui.grid {
    class Grid<T extends Slick.SlickData> extends api.dom.DivEl {
        private defaultHeight;
        private defaultWidth;
        private defaultAutoRenderGridOnDataChanges;
        private slickGrid;
        private dataView;
        private checkboxSelectorPlugin;
        private rowManagerPlugin;
        private loadMask;
        private debounceSelectionChange;
        private onClickListeners;
        static debug: boolean;
        constructor(dataView: DataView<T>, gridColumns?: GridColumn<T>[], gridOptions?: GridOptions<T>);
        protected createOptions(): api.ui.grid.GridOptions<any>;
        protected createColumns(): api.ui.grid.GridColumn<any>[];
        setItemMetadata(metadataHandler: () => void): void;
        mask(): void;
        unmask(): void;
        private autoRenderGridOnDataChanges(dataView);
        private createLoadMask();
        setSelectionModel(selectionModel: Slick.SelectionModel<T, any>): void;
        getDataView(): DataView<T>;
        getDataLength(): number;
        setColumns(columns: GridColumn<T>[], toBegin?: boolean): void;
        getColumns(): GridColumn<T>[];
        getColumnIndex(id: string): number;
        setFilter(f: (item: any, args: any) => boolean): void;
        setOptions(options: GridOptions<T>): void;
        getOptions(): GridOptions<T>;
        getCheckboxSelectorPlugin(): Slick.CheckboxSelectColumn<T>;
        registerPlugin(plugin: Slick.Plugin<T>): void;
        unregisterPlugin(plugin: Slick.Plugin<T>): void;
        doRender(): wemQ.Promise<boolean>;
        renderGrid(): void;
        resizeCanvas(): void;
        updateRowCount(): void;
        invalidateRows(rows: number[]): void;
        invalidate(): void;
        syncGridSelection(preserveHidden: boolean): void;
        focus(): void;
        setOnClick(callback: (event: any, data: GridOnClickData) => void): void;
        setOnKeyDown(callback: (event: any) => void): void;
        getSelectedRows(): number[];
        getSelectedRowItems(): T[];
        setSelectedRows(rows: number[], debounce?: boolean): void;
        selectRow(row: number, debounce?: boolean): number;
        addSelectedRow(row: number, debounce?: boolean): void;
        addSelectedRows(rowsToAdd: number[], debounce?: boolean): void;
        toggleRow(row: number, debounce?: boolean): number;
        isRowSelected(row: number): boolean;
        clearSelection(debounce?: boolean): void;
        isAllSelected(): boolean;
        isAnySelected(): boolean;
        resetActiveCell(): void;
        getCellFromEvent(e: Slick.Event<T>): Slick.Cell;
        getCellNode(row: number, cell: number): HTMLElement;
        moveSelectedUp(): number;
        moveSelectedDown(): number;
        addSelectedUp(startIndex?: number): number;
        addSelectedDown(startIndex?: number): number;
        navigateUp(): void;
        navigateDown(): void;
        getActiveCell(): Slick.Cell;
        setActiveCell(row: number, cell: number): void;
        setCellCssStyles(key: string, hash: Slick.CellCssStylesHash): void;
        removeCellCssStyles(key: string): void;
        getCellCssStyles(key: string): Slick.CellCssStylesHash;
        getCanvasNode(): HTMLCanvasElement;
        getGridPosition(): Slick.CellPosition;
        getRenderedRange(viewportTop?: number, viewportLeft?: number): Slick.Viewport;
        getViewport(viewportTop?: number, viewportLeft?: number): Slick.Viewport;
        updateCell(row: number, cell: number): void;
        updateRow(row: number): void;
        subscribeOnSelectedRowsChanged(callback: (e: any, args: any) => void): void;
        subscribeOnClick(listener: (e: any, args: any) => void): void;
        unsubscribeOnClick(listener: (e: any, args: any) => void): void;
        private notifyClicked(e, args);
        subscribeOnDblClick(callback: (e: any, args: any) => void): void;
        unsubscribeOnDblClick(callback: (e: any, args: any) => void): void;
        subscribeOnContextMenu(callback: (e: any, args: any) => void): void;
        subscribeOnDrag(callback: (e: any, args: any) => void): void;
        subscribeOnDragInit(callback: (e: any, args: any) => void): void;
        subscribeOnDragEnd(callback: (e: any, args: any) => void): void;
        subscribeBeforeMoveRows(callback: (e: any, args: any) => void): void;
        subscribeMoveRows(callback: (e: any, args: any) => void): void;
        subscribeOnScroll(callback: (e: any) => void): void;
        subscribeOnScrolled(callback: (e: Event) => void): void;
        subscribeOnMouseEnter(callback: (e: any, args: any) => void): void;
        subscribeOnMouseLeave(callback: (e: any, args: any) => void): void;
    }
}
declare module api.ui.grid {
    interface GridColumnConfig {
        name: string;
        id: string;
        field: string;
        formatter?: Slick.Formatter<any>;
        style: GridColumnStyle;
        behavior?: any;
    }
    interface GridColumnStyle {
        cssClass?: string;
        minWidth?: number;
        maxWidth?: number;
    }
    class GridColumnBuilder<T extends Slick.SlickData> {
        asyncPostRender: (cellNode: any, row: any, dataContext: any, colDef: any) => void;
        behavior: any;
        cannotTriggerInsert: boolean;
        cssClass: string;
        defaultSortAsc: boolean;
        editor: Slick.Editors.Editor<T>;
        field: string;
        focusable: boolean;
        formatter: Slick.Formatter<T>;
        headerCssClass: string;
        id: string;
        maxWidth: number;
        minWidth: number;
        name: string;
        rerenderOnResize: boolean;
        resizable: boolean;
        selectable: boolean;
        sortable: boolean;
        toolTip: string;
        width: number;
        constructor(source?: GridColumn<T>);
        setAsyncPostRender(asyncPostRender: (cellNode: any, row: any, dataContext: any, colDef: any) => void): GridColumnBuilder<T>;
        setBehavior(behavior: any): GridColumnBuilder<T>;
        setCannotTriggerInsert(cannotTriggerInsert: boolean): GridColumnBuilder<T>;
        setCssClass(cssClass: string): GridColumnBuilder<T>;
        setDefaultSortAsc(defaultSortAsc: boolean): GridColumnBuilder<T>;
        setEditor(editor: Slick.Editors.Editor<T>): GridColumnBuilder<T>;
        setField(field: string): GridColumnBuilder<T>;
        setFocusable(focusable: boolean): GridColumnBuilder<T>;
        setFormatter(formatter: Slick.Formatter<T>): GridColumnBuilder<T>;
        setHeaderCssClass(headerCssClass: string): GridColumnBuilder<T>;
        setId(id: string): GridColumnBuilder<T>;
        setMaxWidth(maxWidth: number): GridColumnBuilder<T>;
        setMinWidth(minWidth: number): GridColumnBuilder<T>;
        setName(name: string): GridColumnBuilder<T>;
        setRerenderOnResize(rerenderOnResize: boolean): GridColumnBuilder<T>;
        setResizable(resizable: boolean): GridColumnBuilder<T>;
        setSelectable(selectable: boolean): GridColumnBuilder<T>;
        setSortable(sortable: boolean): GridColumnBuilder<T>;
        setToolTip(toolTip: string): GridColumnBuilder<T>;
        setWidth(width: number): GridColumnBuilder<T>;
        build(): GridColumn<T>;
    }
    class GridColumn<T extends Slick.SlickData> implements Slick.Column<T> {
        asyncPostRender?: (cellNode: any, row: any, dataContext: any, colDef: any) => void;
        behavior?: any;
        cannotTriggerInsert: boolean;
        cssClass: string;
        defaultSortAsc: boolean;
        editor: Slick.Editors.Editor<T>;
        field: string;
        focusable: boolean;
        formatter: Slick.Formatter<T>;
        headerCssClass: string;
        id: string;
        maxWidth: number;
        minWidth: number;
        name: string;
        rerenderOnResize: boolean;
        resizable: boolean;
        selectable: boolean;
        sortable: boolean;
        toolTip: string;
        width: number;
        constructor(builder: GridColumnBuilder<T>);
        getAsyncPostRender(): (cellNode: any, row: any, dataContext: any, colDef: any) => void;
        getBehavior(): any;
        isCannotTriggerInsert(): boolean;
        getCssClass(): string;
        isDefaultSortAsc(): boolean;
        getEditor(): Slick.Editors.Editor<T>;
        getField(): string;
        isFocusable(): boolean;
        getFormatter(): Slick.Formatter<T>;
        getHeaderCssClass(): string;
        getId(): string;
        getMaxWidth(): number;
        getMinWidth(): number;
        getName(): string;
        isRerenderOnResize(): boolean;
        isResizable(): boolean;
        isSelectable(): boolean;
        isSortable(): boolean;
        getToolTip(): string;
        getWidth(): number;
        setAsyncPostRender(asyncPostRender: (cellNode: any, row: any, dataContext: any, colDef: any) => void): GridColumn<T>;
        setBehavior(behavior: any): GridColumn<T>;
        setCannotTriggerInsert(cannotTriggerInsert: boolean): GridColumn<T>;
        setCssClass(cssClass: string): GridColumn<T>;
        setDefaultSortAsc(defaultSortAsc: boolean): GridColumn<T>;
        setEditor(editor: Slick.Editors.Editor<T>): GridColumn<T>;
        setField(field: string): GridColumn<T>;
        setFocusable(focusable: boolean): GridColumn<T>;
        setFormatter(formatter: Slick.Formatter<T>): GridColumn<T>;
        setHeaderCssClass(headerCssClass: string): GridColumn<T>;
        setId(id: string): GridColumn<T>;
        setBoundaryWidth(minWidth: number, maxWidth: number): GridColumn<T>;
        setMaxWidth(maxWidth: number): GridColumn<T>;
        setMinWidth(minWidth: number): GridColumn<T>;
        setName(name: string): GridColumn<T>;
        setRerenderOnResize(rerenderOnResize: boolean): GridColumn<T>;
        setResizable(resizable: boolean): GridColumn<T>;
        setSelectable(selectable: boolean): GridColumn<T>;
        setSortable(sortable: boolean): GridColumn<T>;
        setToolTip(toolTip: string): GridColumn<T>;
        setWidth(width: number): GridColumn<T>;
    }
}
declare module api.ui.grid {
    class GridOptionsBuilder<T extends Slick.SlickData> {
        asyncEditorLoading: boolean;
        asyncEditorLoadDelay: number;
        asyncPostRenderDelay: number;
        autoEdit: boolean;
        autoHeight: boolean;
        cellFlashingCssClass: string;
        cellHighlightCssClass: string;
        dataItemColumnValueExtractor: any;
        defaultColumnWidth: number;
        defaultFormatter: Slick.Formatter<T>;
        editable: boolean;
        editCommandHandler: any;
        editorFactory: Slick.EditorFactory;
        editorLock: Slick.EditorLock<T>;
        enableAddRow: boolean;
        enableAsyncPostRender: boolean;
        enableCellRangeSelection: any;
        enableCellNavigation: boolean;
        enableColumnReorder: boolean;
        enableRowReordering: any;
        enableTextSelectionOnCells: boolean;
        explicitInitialization: boolean;
        forceFitColumns: boolean;
        forceSyncScrolling: boolean;
        formatterFactory: Slick.FormatterFactory<T>;
        fullWidthRows: boolean;
        headerRowHeight: number;
        leaveSpaceForNewRows: boolean;
        multiColumnSort: boolean;
        multiSelect: boolean;
        rowHeight: number;
        selectedCellCssClass: string;
        showHeaderRow: boolean;
        syncColumnCellResize: boolean;
        topPanelHeight: number;
        hideColumnHeaders: boolean;
        width: string;
        height: string;
        dataIdProperty: string;
        autoRenderGridOnDataChanges: boolean;
        checkableRows: boolean;
        disabledMultipleSelection: boolean;
        dragAndDrop: boolean;
        constructor(source?: GridOptions<T>);
        setAsyncEditorLoading(asyncEditorLoading: boolean): GridOptionsBuilder<T>;
        setAsyncEditorLoadDelay(asyncEditorLoadDelay: number): GridOptionsBuilder<T>;
        setAsyncPostRenderDelay(asyncPostRenderDelay: number): GridOptionsBuilder<T>;
        setAutoEdit(autoEdit: boolean): GridOptionsBuilder<T>;
        setAutoHeight(autoHeight: boolean): GridOptionsBuilder<T>;
        setCellFlashingCssClass(cellFlashingCssClass: string): GridOptionsBuilder<T>;
        setCellHighlightCssClass(cellHighlightCssClass: string): GridOptionsBuilder<T>;
        setDataItemColumnValueExtractor(dataItemColumnValueExtractor: any): GridOptionsBuilder<T>;
        setDefaultColumnWidth(defaultColumnWidth: number): GridOptionsBuilder<T>;
        setDefaultFormatter(defaultFormatter: Slick.Formatter<T>): GridOptionsBuilder<T>;
        setEditable(editable: boolean): GridOptionsBuilder<T>;
        setEditCommandHandler(editCommandHandler: any): GridOptionsBuilder<T>;
        setEditorFactory(editorFactory: Slick.EditorFactory): GridOptionsBuilder<T>;
        setEditorLock(editorLock: Slick.EditorLock<T>): GridOptionsBuilder<T>;
        setEnableAddRow(enableAddRow: boolean): GridOptionsBuilder<T>;
        setEnableAsyncPostRender(enableAsyncPostRender: boolean): GridOptionsBuilder<T>;
        setEnableCellRangeSelection(enableCellRangeSelection: any): GridOptionsBuilder<T>;
        setEnableCellNavigation(enableCellNavigation: boolean): GridOptionsBuilder<T>;
        setEnableColumnReorder(enableColumnReorder: boolean): GridOptionsBuilder<T>;
        setEnableRowReordering(enableRowReordering: any): GridOptionsBuilder<T>;
        setEnableTextSelectionOnCells(enableTextSelectionOnCells: boolean): GridOptionsBuilder<T>;
        setExplicitInitialization(explicitInitialization: boolean): GridOptionsBuilder<T>;
        setForceFitColumns(forceFitColumns: boolean): GridOptionsBuilder<T>;
        setForceSyncScrolling(forceSyncScrolling: boolean): GridOptionsBuilder<T>;
        setFormatterFactory(formatterFactory: Slick.FormatterFactory<T>): GridOptionsBuilder<T>;
        setFullWidthRows(fullWidthRows: boolean): GridOptionsBuilder<T>;
        setHeaderRowHeight(headerRowHeight: number): GridOptionsBuilder<T>;
        setLeaveSpaceForNewRows(leaveSpaceForNewRows: boolean): GridOptionsBuilder<T>;
        setMultiColumnSort(multiColumnSort: boolean): GridOptionsBuilder<T>;
        setMultiSelect(multiSelect: boolean): GridOptionsBuilder<T>;
        setRowHeight(rowHeight: number): GridOptionsBuilder<T>;
        setSelectedCellCssClass(selectedCellCssClass: string): GridOptionsBuilder<T>;
        setShowHeaderRow(showHeaderRow: boolean): GridOptionsBuilder<T>;
        setSyncColumnCellResize(syncColumnCellResize: boolean): GridOptionsBuilder<T>;
        setTopPanelHeight(topPanelHeight: number): GridOptionsBuilder<T>;
        setHideColumnHeaders(hideColumnHeaders: boolean): GridOptionsBuilder<T>;
        setWidth(width: string): GridOptionsBuilder<T>;
        setHeight(height: string): GridOptionsBuilder<T>;
        setDataIdProperty(dataIdProperty: string): GridOptionsBuilder<T>;
        setAutoRenderGridOnDataChanges(autoRenderGridOnDataChanges: boolean): GridOptionsBuilder<T>;
        setCheckableRows(checkableRows: boolean): GridOptionsBuilder<T>;
        disableMultipleSelection(disabledMultipleSelection: boolean): GridOptionsBuilder<T>;
        setDragAndDrop(dragAndDrop: boolean): GridOptionsBuilder<T>;
        build(): GridOptions<T>;
    }
    class GridOptions<T extends Slick.SlickData> implements Slick.GridOptions<T> {
        asyncEditorLoading: boolean;
        asyncEditorLoadDelay: number;
        asyncPostRenderDelay: number;
        autoEdit: boolean;
        autoHeight: boolean;
        cellFlashingCssClass: string;
        cellHighlightCssClass: string;
        dataItemColumnValueExtractor: any;
        defaultColumnWidth: number;
        defaultFormatter: Slick.Formatter<T>;
        editable: boolean;
        editCommandHandler: any;
        editorFactory: Slick.EditorFactory;
        editorLock: Slick.EditorLock<T>;
        enableAddRow: boolean;
        enableAsyncPostRender: boolean;
        enableCellRangeSelection: any;
        enableCellNavigation: boolean;
        enableColumnReorder: boolean;
        enableRowReordering: any;
        enableTextSelectionOnCells: boolean;
        explicitInitialization: boolean;
        forceFitColumns: boolean;
        forceSyncScrolling: boolean;
        formatterFactory: Slick.FormatterFactory<T>;
        fullWidthRows: boolean;
        headerRowHeight: number;
        leaveSpaceForNewRows: boolean;
        multiColumnSort: boolean;
        multiSelect: boolean;
        rowHeight: number;
        selectedCellCssClass: string;
        showHeaderRow: boolean;
        syncColumnCellResize: boolean;
        topPanelHeight: number;
        hideColumnHeaders: boolean;
        width: string;
        height: string;
        dataIdProperty: string;
        autoRenderGridOnDataChanges: boolean;
        checkableRows: boolean;
        disabledMultipleSelection: boolean;
        dragAndDrop: boolean;
        constructor(builder: GridOptionsBuilder<T>);
        isAsyncEditorLoading(): boolean;
        getAsyncEditorLoadDelay(): number;
        getAsyncPostRenderDelay(): number;
        isAutoEdit(): boolean;
        isAutoHeight(): boolean;
        getCellFlashingCssClass(): string;
        getCellHighlightCssClass(): string;
        getDataItemColumnValueExtractor(): any;
        getDefaultColumnWidth(): number;
        getDefaultFormatter(): Slick.Formatter<T>;
        isEditable(): boolean;
        getEditCommandHandler(): any;
        getEditorFactory(): Slick.EditorFactory;
        getEditorLock(): Slick.EditorLock<T>;
        isEnableAddRow(): boolean;
        isEnableAsyncPostRender(): boolean;
        getEnableCellRangeSelection(): any;
        isEnableCellNavigation(): boolean;
        isEnableColumnReorder(): boolean;
        getEnableRowReordering(): any;
        isEnableTextSelectionOnCells(): boolean;
        isExplicitInitialization(): boolean;
        isForceFitColumns(): boolean;
        isForceSyncScrolling(): boolean;
        getFormatterFactory(): Slick.FormatterFactory<T>;
        isFullWidthRows(): boolean;
        getHeaderRowHeight(): number;
        isLeaveSpaceForNewRows(): boolean;
        isMultiColumnSort(): boolean;
        isMultiSelect(): boolean;
        getRowHeight(): number;
        getSelectedCellCssClass(): string;
        getShowHeaderRow(): boolean;
        isSyncColumnCellResize(): boolean;
        getTopPanelHeight(): number;
        isHideColumnHeaders(): boolean;
        getWidth(): string;
        getHeight(): string;
        getDataIdProperty(): string;
        isAutoRenderGridOnDataChanges(): boolean;
        isCheckableRows(): boolean;
        isMultipleSelectionDisabled(): boolean;
        isDragAndDrop(): boolean;
        setAsyncEditorLoading(asyncEditorLoading: boolean): GridOptions<T>;
        setAsyncEditorLoadDelay(asyncEditorLoadDelay: number): GridOptions<T>;
        setAsyncPostRenderDelay(asyncPostRenderDelay: number): GridOptions<T>;
        setAutoEdit(autoEdit: boolean): GridOptions<T>;
        setAutoHeight(autoHeight: boolean): GridOptions<T>;
        setCellFlashingCssClass(cellFlashingCssClass: string): GridOptions<T>;
        setCellHighlightCssClass(cellHighlightCssClass: string): GridOptions<T>;
        setDataItemColumnValueExtractor(dataItemColumnValueExtractor: any): GridOptions<T>;
        setDefaultColumnWidth(defaultColumnWidth: number): GridOptions<T>;
        setDefaultFormatter(defaultFormatter: Slick.Formatter<T>): GridOptions<T>;
        setEditable(editable: boolean): GridOptions<T>;
        setEditCommandHandler(editCommandHandler: any): GridOptions<T>;
        setEditorFactory(editorFactory: Slick.EditorFactory): GridOptions<T>;
        setEditorLock(editorLock: Slick.EditorLock<T>): GridOptions<T>;
        setEnableAddRow(enableAddRow: boolean): GridOptions<T>;
        setEnableAsyncPostRender(enableAsyncPostRender: boolean): GridOptions<T>;
        setEnableCellRangeSelection(enableCellRangeSelection: any): GridOptions<T>;
        setEnableCellNavigation(enableCellNavigation: boolean): GridOptions<T>;
        setEnableColumnReorder(enableColumnReorder: boolean): GridOptions<T>;
        setEnableRowReordering(enableRowReordering: any): GridOptions<T>;
        setEnableTextSelectionOnCells(enableTextSelectionOnCells: boolean): GridOptions<T>;
        setExplicitInitialization(explicitInitialization: boolean): GridOptions<T>;
        setForceFitColumns(forceFitColumns: boolean): GridOptions<T>;
        setForceSyncScrolling(forceSyncScrolling: boolean): GridOptions<T>;
        setFormatterFactory(formatterFactory: Slick.FormatterFactory<T>): GridOptions<T>;
        setFullWidthRows(fullWidthRows: boolean): GridOptions<T>;
        setHeaderRowHeight(headerRowHeight: number): GridOptions<T>;
        setLeaveSpaceForNewRows(leaveSpaceForNewRows: boolean): GridOptions<T>;
        setMultiColumnSort(multiColumnSort: boolean): GridOptions<T>;
        setMultiSelect(multiSelect: boolean): GridOptions<T>;
        setRowHeight(rowHeight: number): GridOptions<T>;
        setSelectedCellCssClass(selectedCellCssClass: string): GridOptions<T>;
        setShowHeaderRow(showHeaderRow: boolean): GridOptions<T>;
        setSyncColumnCellResize(syncColumnCellResize: boolean): GridOptions<T>;
        setTopPanelHeight(topPanelHeight: number): GridOptions<T>;
        setHideColumnHeaders(hideColumnHeaders: boolean): GridOptions<T>;
        setWidth(width: string): GridOptions<T>;
        setHeight(height: string): GridOptions<T>;
        setDataIdProperty(dataIdProperty: string): GridOptions<T>;
        setAutoRenderGridOnDataChanges(autoRenderGridOnDataChanges: boolean): GridOptions<T>;
        setCheckableRows(checkableRows: boolean): GridOptions<T>;
        disableMultipleSelection(disabledMultipleSelection: boolean): GridOptions<T>;
        setDragAndDrop(dragAndDrop: boolean): GridOptions<T>;
    }
}
declare module api.ui.grid {
    class GridOnClickDataBuilder {
        row: number;
        cell: number;
        grid: any;
        constructor(source?: GridOnClickData);
        setRow(row: number): GridOnClickDataBuilder;
        setCell(cell: number): GridOnClickDataBuilder;
        setGrid(grid: any): GridOnClickDataBuilder;
        build(): GridOnClickData;
    }
    class GridOnClickData implements Slick.OnClickEventData {
        row: number;
        cell: number;
        grid: any;
        constructor(builder: GridOnClickDataBuilder);
        getRow(): number;
        getCell(): number;
        getGrid(): any;
    }
}
declare module api.ui.grid {
    class DataView<T extends Slick.SlickData> {
        private slickDataView;
        constructor();
        slick(): Slick.Data.DataView<T>;
        setFilter(f: (item: T, args: any) => boolean): void;
        setFilterArgs(args: any): void;
        beginUpdate(): void;
        endUpdate(): void;
        refresh(): void;
        setItems(items: T[], objectIdProperty?: string): void;
        addItem(item: T): void;
        insertItem(insertBefore: number, item: T): void;
        updateItem(id: string, item: T): void;
        deleteItem(id: string): void;
        syncGridSelection(grid: Slick.Grid<T>, preserveHidden: boolean): void;
        getItem(index: number): T;
        getItems(): T[];
        getItemById(id: string): T;
        getLength(): number;
        getRowById(id: string): number;
        onRowsChanged(callback: (eventData: Slick.EventData, args: any) => void): void;
        onRowCountChanged(listener: (eventData: Slick.EventData, args: Slick.EventData) => void): void;
        setItemMetadataHandler(metadataHandler: () => void): void;
    }
}
declare module api.ui.grid {
    class CollapsingItem<T> {
        private actualItem;
        constructor(actualItem: T);
    }
}
declare module api.ui.grid {
    import Element = api.dom.Element;
    import TreeGrid = api.ui.treegrid.TreeGrid;
    class GridDragHandler<MODEL> {
        protected contentGrid: TreeGrid<MODEL>;
        private positionChangedListeners;
        private draggableItem;
        private draggableTop;
        private rowHeight;
        constructor(treeGrid: TreeGrid<MODEL>);
        protected handleDragInit(event: DragEvent, data: DragEventData): void;
        protected handleDragStart(): void;
        protected handleDrag(event: Event, data: DragEventData): void;
        protected handleDragEnd(event: Event, data: DragEventData): void;
        protected handleBeforeMoveRows(event: Event, data: DragEventData): boolean;
        protected handleMoveRows(event: Event, args: DragEventData): void;
        protected makeMovementInNodes(draggableRow: number, insertBefore: number): number;
        getDraggableItem(): Element;
        protected handleMovements(rowDataId: any, moveBeforeRowDataId: any): void;
        protected getModelId(model: MODEL): any;
        onPositionChanged(listener: () => void): void;
        unPositionChanged(listener: () => void): void;
        private notifyPositionChanged();
    }
    interface DragEventData {
        insertBefore: number;
        rows: number[];
    }
}
declare module api.ui.toolbar {
    import ActionButton = api.ui.button.ActionButton;
    class Toolbar extends api.dom.DivEl implements api.ui.ActionContainer {
        protected fold: FoldButton;
        private hasGreedySpacer;
        protected actions: api.ui.Action[];
        constructor(className?: string);
        addAction(action: api.ui.Action): ActionButton;
        addActions(actions: api.ui.Action[]): void;
        removeActions(): void;
        getActions(): api.ui.Action[];
        addElement(element: api.dom.Element): api.dom.Element;
        addGreedySpacer(): void;
        removeGreedySpacer(): void;
        protected foldOrExpand(): void;
        private getVisibleButtonsWidth(includeFold?);
        private getNextFoldableButton();
        private areAllActionsFolded();
    }
}
declare module api.ui.toolbar {
    class FoldButton extends api.dom.DivEl {
        private span;
        private dropdown;
        private widthCache;
        private hostElement;
        private static expandedCls;
        constructor(caption?: string, hostElement?: api.dom.Element);
        private toggle();
        private onButtonClicked(e);
        private onMenuClicked(e);
        collapse(): void;
        push(element: api.dom.Element, width: number): void;
        pop(): api.dom.Element;
        setLabel(label: string): void;
        getDropdown(): api.dom.DivEl;
        getNextButtonWidth(): number;
        getButtonsCount(): number;
        isEmpty(): boolean;
    }
}
declare module api.ui.mask {
    class Mask extends api.dom.DivEl {
        private masked;
        constructor(itemToMask?: api.dom.Element);
        private cloneWheelEvent(e);
        show(): void;
        private positionOver(masked);
        private isBrowserFirefox();
        private triggerScroll(event);
    }
}
declare module api.ui.mask {
    /**
     * A statically accessible object for masking the whole body.
     */
    class BodyMask extends Mask {
        private static instance;
        static get(): BodyMask;
        constructor();
    }
}
declare module api.ui.mask {
    /**
     * Object to mask an Element with a splash
     */
    class LoadMask extends Mask {
        private splash;
        private spinner;
        private text;
        constructor(el: api.dom.Element);
        show(): void;
        hide(): void;
        setText(text: string): void;
        getText(): string;
        private centerSplash();
    }
}
declare module api.ui.mask {
    class DragMask extends Mask {
        constructor(itemToMask: api.dom.Element);
    }
}
declare module api.ui.treegrid.actions {
    import Action = api.ui.Action;
    import BrowseItem = api.app.browse.BrowseItem;
    import BrowseItemsChanges = api.app.browse.BrowseItemsChanges;
    interface TreeGridActions<M extends api.Equitable> {
        getAllActions(): Action[];
        updateActionsEnabledState(browseItems: BrowseItem<M>[], changes?: BrowseItemsChanges<any>): wemQ.Promise<BrowseItem<M>[]>;
    }
}
declare module api.ui.treegrid.actions {
    class SelectionController extends Checkbox {
        private tooltip;
        constructor(treeGrid: TreeGrid<any>);
    }
}
declare module api.ui.treegrid.actions {
    import Action = api.ui.Action;
    class ClearSelectionAction<DATA> extends Action {
        constructor(treeGrid: TreeGrid<DATA>);
        private createLabel(treeGrid);
        private getCount(treeGrid);
    }
}
declare module api.ui.treegrid.actions {
    class SelectionPanelToggler extends api.ui.button.TogglerButton {
        private tooltip;
        constructor(treeGrid: TreeGrid<any>);
    }
}
declare module api.ui.treegrid {
    import ValidationRecordingViewer = api.form.ValidationRecordingViewer;
    import Grid = api.ui.grid.Grid;
    import GridOptions = api.ui.grid.GridOptions;
    import GridColumn = api.ui.grid.GridColumn;
    enum SelectionOnClickType {
        HIGHLIGHT = 0,
        SELECT = 1,
        NONE = 2,
    }
    class TreeGrid<DATA> extends api.ui.panel.Panel {
        static LEVEL_STEP_INDENT: number;
        private columns;
        private gridOptions;
        private grid;
        private gridData;
        private root;
        private toolbar;
        private contextMenu;
        private expandAll;
        private active;
        private loadedListeners;
        private contextMenuListeners;
        private selectionChangeListeners;
        private highlightingChangeListeners;
        private dataChangeListeners;
        private activeChangedListeners;
        private loadBufferSize;
        private loading;
        private scrollable;
        private quietErrorHandling;
        private errorPanel;
        private highlightedNode;
        private selectionOnClick;
        private interval;
        private idPropertyName;
        constructor(builder: TreeGridBuilder<DATA>);
        private initSelectorPlugin();
        private initToolbar(showToolbar);
        protected setColumns(columns: GridColumn<TreeNode<DATA>>[], toBegin?: boolean): void;
        getFirstSelectedOrHighlightedNode(): TreeNode<DATA>;
        private onSelectRange(event, navigateFn);
        private initEventListeners(builder);
        private onRenderedHandler(builder);
        private onRemovedHandler(builder, keyBindings);
        private bindClickEvents();
        private onClickWithShift(event, data);
        private onClickWithCmd(data);
        private onExpand(elem, data);
        private recursivelyExpandHighlightedNode();
        private onCollapse(elem, data);
        private onRowSelected(data);
        private onRowHighlighted(elem, data);
        private isSelectionNotEmpty();
        private bindKeys(builder, keyBindings);
        private onUpKeyPress();
        private onDownKeyPress();
        private onLeftKeyPress();
        private onRightKeyPress();
        expandRow(row: number): void;
        collapseRow(row: number): void;
        private onAwithModKeyPress;
        private onSpaceKeyPress();
        private onEnterKeyPress();
        protected editItem(node: TreeNode<DATA>): void;
        setContextMenu(contextMenu: TreeGridContextMenu): void;
        private navigateUp();
        private navigateDown();
        private getRowIndexByNode(node);
        private getRowByNode(node);
        protected highlightCurrentNode(): void;
        private highlightRowByNode(node);
        private unhighlightCurrentRow(skipEvent?);
        private unhighlightRow(row, skipEvent?);
        removeHighlighting(skipEvent?: boolean): void;
        private unhighlightRows(skipEvent?);
        private unselectAllRows();
        isInRenderingView(): boolean;
        private updateColumnsFormatter(columns);
        isEmptyNode(node: TreeNode<DATA>): boolean;
        getEmptyNodesCount(): number;
        mask(): void;
        unmask(): void;
        getGrid(): Grid<TreeNode<DATA>>;
        getOptions(): GridOptions<DATA>;
        getColumns(): GridColumn<TreeNode<DATA>>[];
        getContextMenu(): TreeGridContextMenu;
        getRoot(): TreeRoot<DATA>;
        isNewlySelected(): boolean;
        isActive(): boolean;
        setActive(active?: boolean): void;
        onActiveChanged(listener: (active: boolean) => void): void;
        unActiveChanged(listener: (active: boolean) => void): void;
        private notifyActiveChanged(active);
        getToolbar(): TreeGridToolbar;
        hasToolbar(): boolean;
        scrollToRow(row: number, skipSelectionCheck?: boolean): void;
        queryScrollable(): api.dom.Element;
        private loadEmptyNode(node);
        private select(fetchedChildren);
        private areAllOldChildrenSelected(oldChildren);
        private postLoad();
        /**
         * Used to determine if a data have child nodes.
         * Must be overridden for the grids with a tree structure.
         */
        hasChildren(data: DATA): boolean;
        /**
         * Used to get the data identifier or key.
         * Must be overridden.
         */
        getDataId(data: DATA): string;
        isEmpty(): boolean;
        /**
         * Fetches a single element.
         * Can be used to update/add a single node without
         * retrieving a a full data, or for the purpose of the
         * infinite scroll.
         */
        fetch(node: TreeNode<DATA>, dataId?: string): wemQ.Promise<DATA>;
        /**
         * Used as a default children fetcher.
         * Must be overridden to use predefined root nodes.
         */
        fetchChildren(parentNode?: TreeNode<DATA>): wemQ.Promise<DATA[]>;
        /**
         * Used as a default root fetcher.
         * Can be overridden to use predefined root nodes.
         * By default, return empty fetchChildren request.
         */
        fetchRoot(): wemQ.Promise<DATA[]>;
        private fetchData(parentNode?);
        dataToTreeNode(data: DATA, parent: TreeNode<DATA>, expandAllowed?: boolean): TreeNode<DATA>;
        dataToTreeNodes(dataArray: DATA[], parent: TreeNode<DATA>, expandAllowed?: boolean): TreeNode<DATA>[];
        filter(dataList: DATA[]): void;
        resetFilter(): void;
        selectNode(dataId: string): void;
        refreshNodeById(dataId: string): void;
        selectAll(): void;
        deselectAll(): void;
        deselectNodes(dataIds: string[]): void;
        getSelectedNodes(): TreeNode<DATA>[];
        getSelectedDataList(): DATA[];
        setSelectionOnClick(type: SelectionOnClickType): void;
        reload(parentNodeData?: DATA, idPropertyName?: string): wemQ.Promise<void>;
        protected handleError(reason: any, message?: String): void;
        protected hideErrorPanel(): void;
        private reloadNode(parentNode?, expandedNodesDataId?);
        refreshNode(node?: TreeNode<DATA>): void;
        refresh(): void;
        updateNode(data: DATA, oldDataId?: string): wemQ.Promise<void>;
        updateNodes(data: DATA, oldDataId?: string): wemQ.Promise<void>;
        private fetchAndUpdateNodes(nodesToUpdate, dataId?);
        deleteNode(data: DATA): void;
        private deleteRootNode(root, data);
        /**
         * @param data
         * @param nextToSelection - by default node is appended as child to selection or root, set this to true to append to the same level
         * @param stashedParentNode
         */
        appendNode(data: DATA, nextToSelection?: boolean, prepend?: boolean, stashedParentNode?: TreeNode<DATA>): wemQ.Promise<void>;
        getParentNode(nextToSelection?: boolean, stashedParentNode?: TreeNode<DATA>): TreeNode<DATA>;
        insertNode(data: DATA, nextToSelection?: boolean, index?: number, stashedParentNode?: TreeNode<DATA>): wemQ.Promise<void>;
        private doInsertNodeToParentWithChildren(parentNode, data, root, index, stashedParentNode, isRootParentNode);
        deleteNodes(dataList: DATA[]): void;
        private deleteRootNodes(root, dataList);
        initData(nodes: TreeNode<DATA>[]): void;
        private resetCurrentSelection(nodes);
        expandNode(node?: TreeNode<DATA>, expandAll?: boolean): wemQ.Promise<boolean>;
        isAllSelected(): boolean;
        isAnySelected(): boolean;
        protected updateExpanded(): void;
        private updateSelectedNode(node);
        collapseNode(node: TreeNode<DATA>, collapseAll?: boolean): void;
        notifyLoaded(): void;
        onLoaded(listener: () => void): this;
        unLoaded(listener: () => void): this;
        getItem(rowIndex: number): TreeNode<DATA>;
        private notifySelectionChanged(event, rows);
        private notifyHighlightingChanged();
        triggerSelectionChangedListeners(): void;
        onHighlightingChanged(listener: (node: TreeNode<DATA>) => void): this;
        unHighlightingChanged(listener: (node: TreeNode<DATA>) => void): this;
        onSelectionChanged(listener: (currentSelection: TreeNode<DATA>[], fullSelection: TreeNode<DATA>[], highlighted: boolean) => void): this;
        unSelectionChanged(listener: (currentSelection: TreeNode<DATA>[], fullSelection: TreeNode<DATA>[], highlighted: boolean) => void): this;
        private notifyContextMenuShown(x, y);
        protected getErrorPanel(): ValidationRecordingViewer;
        onContextMenuShown(listener: () => void): this;
        unContextMenuShown(listener: () => void): this;
        notifyDataChanged(event: DataChangedEvent<DATA>): void;
        onDataChanged(listener: (event: DataChangedEvent<DATA>) => void): this;
        unDataChanged(listener: (event: DataChangedEvent<DATA>) => void): this;
        isFiltered(): boolean;
        invalidate(): void;
        initAndRender(): void;
        refreshNodeData(parentNode: TreeNode<DATA>): wemQ.Promise<TreeNode<DATA>>;
        sortNodeChildren(node: TreeNode<DATA>): void;
        isNodeHighlighted(node: TreeNode<DATA>): boolean;
        protected handleItemMetadata(row: number): {
            cssClasses: string;
        };
    }
}
declare module api.ui.treegrid {
    class TreeNode<DATA> {
        private id;
        private dataId;
        private data;
        private expanded;
        private selected;
        private pinned;
        private maxChildren;
        private parent;
        private children;
        /**
         * A cache for stashing viewers by name, so that they can be reused.
         */
        private viewersByName;
        constructor(builder: TreeNodeBuilder<DATA>);
        getId(): string;
        hasData(): boolean;
        getDataId(): string;
        isExpanded(): boolean;
        setExpanded(expanded?: boolean): void;
        isSelected(): boolean;
        setSelected(selected?: boolean): void;
        isPinned(): boolean;
        getMaxChildren(): number;
        setMaxChildren(maxChildren: number): void;
        getData(): DATA;
        setData(data: DATA): void;
        setDataId(dataId: string): void;
        setViewer(name: string, viewer: api.ui.Viewer<any>): void;
        clearViewers(): void;
        getViewer(name: string): api.ui.Viewer<any>;
        getParent(): TreeNode<DATA>;
        setParent(parent: TreeNode<DATA>): void;
        hasParent(): boolean;
        getRoot(): TreeNode<DATA>;
        private removeDuplicates();
        getChildren(): TreeNode<DATA>[];
        setChildren(children: TreeNode<DATA>[]): void;
        hasChildren(): boolean;
        regenerateId(): void;
        regenerateIds(): void;
        insertChild(child: TreeNode<DATA>, index?: number): void;
        moveChild(child: TreeNode<DATA>, index?: number): void;
        addChild(child: TreeNode<DATA>, isToBegin?: boolean): void;
        removeChild(child: TreeNode<DATA>): void;
        removeChildren(): void;
        remove(): void;
        isVisible(): boolean;
        /**
         * Transforms tree into the list of nodes with current node as root.
         * @param empty    - determines to get nodes with empty data.
         * @param expanded - determines to display only reachable nodes.
         * @param selected - determines to display only seleted nodes.
         */
        treeToList(empty?: boolean, expanded?: boolean, selected?: boolean): TreeNode<DATA>[];
        findNode(dataId: string): TreeNode<DATA>;
        findNodes(dataId: string): TreeNode<DATA>[];
        calcLevel(): number;
        pinToRoot(): void;
    }
}
declare module api.ui.treegrid {
    class TreeRoot<DATA> {
        private defaultRoot;
        private filteredRoot;
        private filtered;
        private newlySelected;
        private currentSelection;
        private stashedSelection;
        constructor();
        getDefaultRoot(): TreeNode<DATA>;
        resetDefaultRoot(rootData?: DATA): void;
        getFilteredRoot(): TreeNode<DATA>;
        resetFilteredRoot(rootData?: DATA): void;
        resetCurrentRoot(rootData?: DATA): void;
        getCurrentRoot(): TreeNode<DATA>;
        isFiltered(): boolean;
        setFiltered(filtered?: boolean): void;
        isNewlySelected(): boolean;
        private updateNewlySelected(newSelection);
        getCurrentSelection(): TreeNode<DATA>[];
        setCurrentSelection(selection: TreeNode<DATA>[]): void;
        getStashedSelection(): TreeNode<DATA>[];
        stashSelection(): void;
        getFullSelection(uniqueOnly?: boolean): TreeNode<DATA>[];
        private cleanStashedSelection();
        clearStashedSelection(): void;
        removeSelections(dataIds: string[]): void;
        updateSelection(dataId: string, data: DATA): void;
    }
}
declare module api.ui.treegrid {
    import SelectionPanelToggler = api.ui.treegrid.actions.SelectionPanelToggler;
    class TreeGridToolbar extends api.dom.DivEl {
        private selectionPanelToggler;
        constructor(treeGrid: TreeGrid<any>);
        getSelectionPanelToggler(): SelectionPanelToggler;
    }
}
declare module api.ui.treegrid {
    class DateTimeFormatter {
        static format(row: number, cell: number, value: any, columnDef: any, item: any): string;
        static formatNoTimestamp(row: number, cell: number, value: any, columnDef: any, item: any): string;
        static createHtml(date: Date): string;
        static createHtmlNoTimestamp(date: Date): string;
        private static zeroPad(n, width);
    }
}
declare module api.ui.treegrid {
    import GridColumnConfig = api.ui.grid.GridColumnConfig;
    import GridColumn = api.ui.grid.GridColumn;
    import GridOptions = api.ui.grid.GridOptions;
    class TreeGridBuilder<NODE> {
        private expandAll;
        private showToolbar;
        private contextMenu;
        private options;
        private columns;
        private classes;
        private autoLoad;
        private autoHeight;
        private hotkeysEnabled;
        private partialLoadEnabled;
        private loadBufferSize;
        private quietErrorHandling;
        private idPropertyName;
        private columnUpdater;
        constructor(grid?: TreeGrid<NODE>);
        nodeExtractor(node: any, column: Slick.Column<NODE>): any;
        buildDefaultOptions(): GridOptions<NODE>;
        buildDefaultColumns(): GridColumn<TreeNode<NODE>>[];
        copyOptions(options: GridOptions<NODE>): TreeGridBuilder<NODE>;
        copyColumns(columns: GridColumn<TreeNode<NODE>>[]): TreeGridBuilder<NODE>;
        isShowToolbar(): boolean;
        getContextMenu(): TreeGridContextMenu;
        getOptions(): GridOptions<NODE>;
        getColumns(): GridColumn<TreeNode<NODE>>[];
        getClasses(): string;
        isExpandAll(): boolean;
        setExpandAll(value: boolean): TreeGridBuilder<NODE>;
        setShowToolbar(showToolbar: boolean): TreeGridBuilder<NODE>;
        setContextMenu(contextMenu: TreeGridContextMenu): TreeGridBuilder<NODE>;
        setOptions(options: GridOptions<NODE>): TreeGridBuilder<NODE>;
        setColumns(columns: GridColumn<TreeNode<NODE>>[]): TreeGridBuilder<NODE>;
        setColumnConfig(columnConfig: GridColumnConfig[]): TreeGridBuilder<NODE>;
        setClasses(classes: string): TreeGridBuilder<NODE>;
        prependClasses(classes: string): TreeGridBuilder<NODE>;
        setAutoLoad(autoLoad: boolean): TreeGridBuilder<NODE>;
        isAutoLoad(): boolean;
        setAutoHeight(autoHeight: boolean): TreeGridBuilder<NODE>;
        isAutoHeight(): boolean;
        setCheckableRows(checkable: boolean): TreeGridBuilder<NODE>;
        isCheckableRows(): boolean;
        setDragAndDrop(dragAndDrop: boolean): TreeGridBuilder<NODE>;
        isDragAndDrop(): boolean;
        setSelectedCellCssClass(selectedCellCss: string): TreeGridBuilder<NODE>;
        getSelectedCellCssClass(): string;
        disableMultipleSelection(disableMultipleSelection: boolean): TreeGridBuilder<NODE>;
        isMultipleSelectionDisabled(): boolean;
        setHotkeysEnabled(enabled: boolean): TreeGridBuilder<NODE>;
        isHotkeysEnabled(): boolean;
        setPartialLoadEnabled(enabled: boolean): TreeGridBuilder<NODE>;
        isPartialLoadEnabled(): boolean;
        setLoadBufferSize(loadBufferSize: number): TreeGridBuilder<NODE>;
        getLoadBufferSize(): number;
        setRowHeight(rowHeight: number): TreeGridBuilder<NODE>;
        setQuietErrorHandling(value: boolean): TreeGridBuilder<NODE>;
        getQuietErrorHandling(): boolean;
        setIdPropertyName(value: string): TreeGridBuilder<NODE>;
        getIdPropertyName(): string;
        setColumnUpdater(columnUpdater: () => void): void;
        getColumnUpdater(): () => void;
        private buildColumn(columnConfig);
        /**
         * Should be overriden by child class.
         */
        build(): TreeGrid<NODE>;
    }
}
declare module api.ui.treegrid {
    class TreeNodeBuilder<NODE> {
        private dataId;
        private data;
        private expanded;
        private selected;
        private pinned;
        private maxChildren;
        private parent;
        private children;
        constructor(node?: TreeNode<NODE>);
        isExpanded(): boolean;
        setExpanded(expanded?: boolean): TreeNodeBuilder<NODE>;
        isSelected(): boolean;
        setSelected(selected?: boolean): TreeNodeBuilder<NODE>;
        isPinned(): boolean;
        setPinned(pinned?: boolean): TreeNodeBuilder<NODE>;
        getMaxChildren(): number;
        setMaxChildren(maxChildren: number): void;
        getData(): NODE;
        getDataId(): string;
        setData(data: NODE, dataId: string): TreeNodeBuilder<NODE>;
        getParent(): TreeNode<NODE>;
        setParent(parent: TreeNode<NODE>): TreeNodeBuilder<NODE>;
        getChildren(): TreeNode<NODE>[];
        setChildren(children: TreeNode<NODE>[]): TreeNodeBuilder<NODE>;
        build(): TreeNode<NODE>;
    }
}
declare module api.ui.treegrid {
    import TreeGridActions = api.ui.treegrid.actions.TreeGridActions;
    class TreeGridContextMenu extends api.ui.menu.ContextMenu {
        private actions;
        constructor(actions: TreeGridActions<any>);
        getActions(): TreeGridActions<any>;
        showAt(x: number, y: number): void;
        private restrainX(x);
        private restrainY(y);
    }
}
declare module api.ui.treegrid {
    class ContextMenuShownEvent {
        private x;
        private y;
        constructor(x: number, y: number);
        getX(): number;
        getY(): number;
    }
}
declare module api.ui.treegrid {
    class DataChangedEvent<DATA> {
        static ADDED: string;
        static UPDATED: string;
        static DELETED: string;
        private treeNodes;
        private type;
        constructor(treeNode: TreeNode<DATA>[], action: string);
        getTreeNodes(): TreeNode<DATA>[];
        getType(): string;
    }
}
declare module api.ui.treegrid {
    class TreeGridItemClickedEvent extends api.event.Event {
        private node;
        private selection;
        constructor(node: TreeNode<any>, selection?: boolean);
        hasSelection(): boolean;
        getTreeNode(): TreeNode<any>;
        static on(handler: (event: TreeGridItemClickedEvent) => void): void;
        static un(handler?: (event: TreeGridItemClickedEvent) => void): void;
    }
}
declare module api.ui.selector {
    interface Option<T> extends Slick.SlickData {
        value: string;
        displayValue: T;
        indices?: string[];
        readOnly?: boolean;
        empty?: boolean;
        disabled?: boolean;
    }
}
declare module api.ui.selector {
    class OptionFilterInput extends api.ui.text.TextInput {
        private placeholderText;
        constructor(placeholderText?: string);
        openForTypingAndFocus(): void;
        openForTyping(): void;
    }
}
declare module api.ui.selector {
    class OptionFilterInputValueChangedEvent<OPTION_DISPLAY_VALUE> {
        private oldValue;
        private newValue;
        constructor(oldValue: string, newValue: string);
        getOldValue(): string;
        getNewValue(): string;
    }
}
declare module api.ui.selector {
    class OptionSelectedEvent<OPTION_DISPLAY_VALUE> {
        private option;
        private previousOption;
        private index;
        constructor(option: Option<OPTION_DISPLAY_VALUE>, previousOption: Option<OPTION_DISPLAY_VALUE>, index?: number);
        getOption(): Option<OPTION_DISPLAY_VALUE>;
        getPreviousOption(): Option<OPTION_DISPLAY_VALUE>;
        getIndex(): number;
    }
}
declare module api.ui.selector {
    class DropdownGridRowSelectedEvent {
        private row;
        constructor(row: number);
        getRow(): number;
    }
}
declare module api.ui.selector {
    class DropdownGridMultipleSelectionEvent {
        private rows;
        constructor(rows: number[]);
        getRows(): number[];
    }
}
declare module api.ui.selector {
    class DefaultOptionDisplayValueViewer extends api.ui.Viewer<any> {
        constructor();
        setObject(object: any): void;
        getPreferredHeight(): number;
    }
}
declare module api.ui.selector {
    import Viewer = api.ui.Viewer;
    interface DropdownGridConfig<OPTION_DISPLAY_VALUE> {
        maxHeight?: number;
        width: number;
        optionDisplayValueViewer?: Viewer<OPTION_DISPLAY_VALUE>;
        filter: (item: Option<OPTION_DISPLAY_VALUE>, args: any) => boolean;
        dataIdProperty?: string;
        multipleSelections?: boolean;
        isDropdownGrid?: boolean;
        optionDataHelper?: OptionDataHelper<OPTION_DISPLAY_VALUE>;
        optionDataLoader?: OptionDataLoader<OPTION_DISPLAY_VALUE>;
    }
    class DropdownGrid<OPTION_DISPLAY_VALUE> {
        protected maxHeight: number;
        protected customHeight: number;
        protected width: number;
        protected dataIdProperty: string;
        protected optionDisplayValueViewer: Viewer<OPTION_DISPLAY_VALUE>;
        protected filter: (item: Option<OPTION_DISPLAY_VALUE>, args: any) => boolean;
        protected rowSelectionListeners: {
            (event: DropdownGridRowSelectedEvent): void;
        }[];
        protected multipleSelectionListeners: {
            (event: DropdownGridMultipleSelectionEvent): void;
        }[];
        protected rowCountChangedListeners: {
            (): void;
        }[];
        protected multipleSelections: boolean;
        protected config: DropdownGridConfig<OPTION_DISPLAY_VALUE>;
        constructor(config: DropdownGridConfig<OPTION_DISPLAY_VALUE>);
        setReadonlyChecker(checker: (optionToCheck: OPTION_DISPLAY_VALUE) => boolean): void;
        presetDefaultOption(data: OPTION_DISPLAY_VALUE): void;
        protected initGridAndData(): void;
        reload(): wemQ.Promise<void>;
        getElement(): api.dom.Element;
        getGrid(): api.ui.grid.Grid<any>;
        protected getGridData(): api.ui.grid.DataView<any>;
        private initCommonGridProps();
        protected initGridEventListeners(): void;
        renderGrid(): void;
        isVisible(): boolean;
        show(): void;
        hide(): void;
        getSelectedOptionCount(): number;
        protected createOptions(): api.ui.grid.GridOptions<any>;
        protected createColumns(): api.ui.grid.GridColumn<any>[];
        setOptions(options: Option<OPTION_DISPLAY_VALUE>[]): void;
        removeAllOptions(): void;
        addOption(option: Option<OPTION_DISPLAY_VALUE>): void;
        hasOptions(): boolean;
        getOptionCount(): number;
        getOptions(): Option<OPTION_DISPLAY_VALUE>[];
        getSelectedOptions(): Option<OPTION_DISPLAY_VALUE>[];
        getOptionByValue(value: string): Option<OPTION_DISPLAY_VALUE>;
        getOptionByRow(rowIndex: number): Option<OPTION_DISPLAY_VALUE>;
        getRowByValue(value: string): number;
        setFilterArgs(args: any): void;
        setTopPx(value: number): void;
        setWidthPx(value: number): void;
        adjustGridHeight(): void;
        addSelections(selectedOptions: Option<OPTION_DISPLAY_VALUE>[]): void;
        markSelections(selectedOptions: Option<OPTION_DISPLAY_VALUE>[], ignoreEmpty?: boolean): void;
        markReadOnly(selectedOptions: Option<OPTION_DISPLAY_VALUE>[]): void;
        hasActiveRow(): boolean;
        getActiveRow(): number;
        expandActiveRow(): void;
        collapseActiveRow(): void;
        navigateToRow(row: number): void;
        navigateToNextRow(): void;
        navigateToPreviousRow(): void;
        resetActiveSelection(): void;
        setCustomHeight(height: number): void;
        resetCustomHeight(): void;
        toggleRowSelection(row: number, isMaximumReached?: boolean): void;
        navigateToFirstRow(): void;
        onRowSelection(listener: (event: DropdownGridRowSelectedEvent) => void): void;
        unRowSelection(listener: (event: DropdownGridRowSelectedEvent) => void): void;
        onClick(callback: (e: MouseEvent, args: any) => void): void;
        unClick(callback: (e: MouseEvent, args: any) => void): void;
        onMultipleSelection(listener: (event: DropdownGridMultipleSelectionEvent) => void): void;
        unMultipleSelection(listener: (event: DropdownGridMultipleSelectionEvent) => void): void;
        protected notifyRowSelection(rowSelected: number): void;
        protected notifyMultipleSelection(rowsSelected: number[]): void;
        onRowCountChanged(listener: () => void): void;
        unRowCountChanged(listener: () => void): void;
        notifyRowCountChanged(): void;
    }
}
declare module api.ui.selector {
    import TreeNode = api.ui.treegrid.TreeNode;
    import TreeGrid = api.ui.treegrid.TreeGrid;
    class OptionsTreeGrid<OPTION_DISPLAY_VALUE> extends TreeGrid<Option<OPTION_DISPLAY_VALUE>> {
        private loader;
        private treeDataHelper;
        private readonlyChecker;
        private isSelfLoading;
        private defaultOption;
        private isDefaultOptionActive;
        constructor(columns: api.ui.grid.GridColumn<any>[], gridOptions: api.ui.grid.GridOptions<any>, loader: OptionDataLoader<OPTION_DISPLAY_VALUE>, treeDataHelper: OptionDataHelper<OPTION_DISPLAY_VALUE>);
        setOptions(options: Option<OPTION_DISPLAY_VALUE>[]): void;
        setReadonlyChecker(checker: (optionToCheck: OPTION_DISPLAY_VALUE) => boolean): void;
        queryScrollable(): api.dom.Element;
        reload(parentNodeData?: Option<OPTION_DISPLAY_VALUE>): wemQ.Promise<void>;
        expandNode(node?: TreeNode<Option<OPTION_DISPLAY_VALUE>>, expandAll?: boolean): wemQ.Promise<boolean>;
        private initEventHandlers();
        hasChildren(option: Option<OPTION_DISPLAY_VALUE>): boolean;
        getDataId(option: Option<OPTION_DISPLAY_VALUE>): string;
        isEmptyNode(node: TreeNode<Option<OPTION_DISPLAY_VALUE>>): boolean;
        fetch(node: TreeNode<Option<OPTION_DISPLAY_VALUE>>, dataId?: string): wemQ.Promise<Option<OPTION_DISPLAY_VALUE>>;
        fetchChildren(parentNode?: TreeNode<Option<OPTION_DISPLAY_VALUE>>): wemQ.Promise<Option<OPTION_DISPLAY_VALUE>[]>;
        presetDefaultOption(data: OPTION_DISPLAY_VALUE): void;
        private scrollToDefaultOption(parentNode, startFrom);
        private fetchBatchOfChildren(parentNode);
        private optionsDataToTreeNodeOption(data);
        private optionDataToTreeNodeOption(data);
        private makeEmptyData();
        protected handleItemMetadata(row: number): {
            cssClasses: string;
        };
    }
}
declare module api.ui.selector {
    import TreeNode = api.ui.treegrid.TreeNode;
    import Element = api.dom.Element;
    class DropdownTreeGrid<OPTION_DISPLAY_VALUE> extends DropdownGrid<OPTION_DISPLAY_VALUE> {
        private optionsTreeGrid;
        constructor(config: DropdownGridConfig<OPTION_DISPLAY_VALUE>);
        expandActiveRow(): void;
        collapseActiveRow(): void;
        reload(): wemQ.Promise<void>;
        setReadonlyChecker(checker: (optionToCheck: OPTION_DISPLAY_VALUE) => boolean): void;
        presetDefaultOption(data: OPTION_DISPLAY_VALUE): void;
        setOptions(options: Option<OPTION_DISPLAY_VALUE>[]): void;
        getSelectedOptions(): Option<OPTION_DISPLAY_VALUE>[];
        protected initGridAndData(): void;
        protected initGridEventListeners(): void;
        markSelections(selectedOptions: Option<OPTION_DISPLAY_VALUE>[], ignoreEmpty?: boolean): void;
        protected createColumns(): api.ui.grid.GridColumn<any>[];
        getElement(): Element;
        getGrid(): api.ui.grid.Grid<TreeNode<Option<OPTION_DISPLAY_VALUE>>>;
        protected getGridData(): api.ui.grid.DataView<TreeNode<Option<OPTION_DISPLAY_VALUE>>>;
        getOptionByRow(rowIndex: number): Option<OPTION_DISPLAY_VALUE>;
        getOptionByValue(value: string): Option<OPTION_DISPLAY_VALUE>;
    }
}
declare module api.ui.selector {
    import Element = api.dom.Element;
    class DropdownListGrid<OPTION_DISPLAY_VALUE> extends DropdownGrid<OPTION_DISPLAY_VALUE> {
        protected grid: api.ui.grid.Grid<Option<OPTION_DISPLAY_VALUE>>;
        protected gridData: api.ui.grid.DataView<Option<OPTION_DISPLAY_VALUE>>;
        constructor(config: DropdownGridConfig<OPTION_DISPLAY_VALUE>);
        protected initGridAndData(): void;
        getElement(): Element;
        getGrid(): api.ui.grid.Grid<Option<OPTION_DISPLAY_VALUE>>;
        protected getGridData(): api.ui.grid.DataView<Option<OPTION_DISPLAY_VALUE>>;
    }
}
declare module api.ui.selector {
    class DropdownList<OPTION_DISPLAY_VALUE> {
        private emptyDropdown;
        private dropdownGrid;
        constructor(config: DropdownGridConfig<OPTION_DISPLAY_VALUE>);
        private initDropdownGrid(config);
        getDropdownGrid(): DropdownGrid<OPTION_DISPLAY_VALUE>;
        renderDropdownGrid(): void;
        getEmptyDropdown(): api.dom.DivEl;
        isDropdownShown(): boolean;
        setOptions(options: Option<OPTION_DISPLAY_VALUE>[], noOptionsText: string): void;
        removeAllOptions(): void;
        addOption(option: Option<OPTION_DISPLAY_VALUE>): void;
        hasOptions(): boolean;
        getOptionCount(): number;
        getOptions(): Option<OPTION_DISPLAY_VALUE>[];
        getSelectedOptions(): Option<OPTION_DISPLAY_VALUE>[];
        getOptionByValue(value: string): Option<OPTION_DISPLAY_VALUE>;
        getOptionByRow(rowIndex: number): Option<OPTION_DISPLAY_VALUE>;
        setFilterArgs(args: any): void;
        resizeDropdownTo(height: number): void;
        resetDropdownSize(): void;
        resetActiveSelection(): void;
        showDropdown(selectedOptions?: Option<OPTION_DISPLAY_VALUE>[], noOptionsText?: string): void;
        hideDropdown(): void;
        setEmptyDropdownText(label: string): void;
        setTopPx(value: number): void;
        setWidth(value: number): void;
        hasActiveRow(): boolean;
        getActiveRow(): number;
        nagivateToFirstRow(): void;
        navigateToRowIfNotActive(selectedOption?: Option<OPTION_DISPLAY_VALUE>): void;
        navigateToNextRow(): void;
        navigateToPreviousRow(): void;
        markSelections(selectedOptions: Option<OPTION_DISPLAY_VALUE>[], ignoreEmpty?: boolean): void;
        addSelections(selectedOptions: Option<OPTION_DISPLAY_VALUE>[]): void;
        onRowCountChanged(listener: () => void): void;
        onRowSelection(listener: (event: DropdownGridRowSelectedEvent) => void): void;
        unRowSelection(listener: (event: DropdownGridRowSelectedEvent) => void): void;
    }
}
declare module api.ui.selector {
    class DropdownExpandedEvent {
        private expanded;
        private dropDownElement;
        constructor(dropDownElement: api.dom.Element, expanded: boolean);
        isExpanded(): boolean;
        getDropdownElement(): api.dom.Element;
    }
}
declare module api.ui.selector {
    import Element = api.dom.Element;
    class SelectorOnBlurEvent extends api.event.Event {
        private selector;
        constructor(selector: Element);
        getSelector(): Element;
        static on(handler: (event: SelectorOnBlurEvent) => void): void;
        static un(handler?: (event: SelectorOnBlurEvent) => void): void;
    }
}
declare module api.ui.selector {
    interface OptionDataHelper<DATA> {
        hasChildren(data: DATA): boolean;
        getDataId(data: DATA): string;
        isDisabled(data: DATA): boolean;
        isDescendingPath(childOption: DATA, parentOption: DATA): any;
    }
}
declare module api.ui.selector {
    import TreeNode = api.ui.treegrid.TreeNode;
    interface OptionDataLoader<DATA> {
        fetch(node: TreeNode<Option<DATA>>): wemQ.Promise<DATA>;
        fetchChildren(parentNode: TreeNode<Option<DATA>>, from?: number, size?: number): wemQ.Promise<OptionDataLoaderData<DATA>>;
        checkReadonly(options: DATA[]): wemQ.Promise<string[]>;
    }
    class OptionDataLoaderData<DATA> {
        private data;
        private hits;
        private totalHits;
        constructor(data: DATA[], hits?: number, totalHits?: number);
        getData(): DATA[];
        getHits(): number;
        getTotalHits(): number;
    }
}
declare module api.ui.selector.list {
    class ListBox<I> extends api.dom.UlEl {
        private items;
        private itemViews;
        private itemsAddedListeners;
        private itemsRemovedListeners;
        constructor(className?: string);
        setItems(items: I[], silent?: boolean): void;
        getItems(): I[];
        getItem(id: string): I;
        clearItems(silent?: boolean): void;
        addItem(...items: I[]): void;
        addItems(items: I[]): void;
        addItemReadOnly(...items: I[]): void;
        private doAddItem(readOnly, items);
        removeItem(item: I): void;
        removeItems(items: I[]): void;
        replaceItem(item: I, append?: boolean): void;
        getItemCount(): number;
        protected createItemView(item: I, readOnly: boolean): api.dom.Element;
        protected getItemId(item: I): string;
        getItemView(item: I): dom.Element;
        getItemViews(): dom.Element[];
        refreshList(): void;
        private layoutList(items);
        private removeItemView(item);
        private addItemView(item, readOnly?);
        onItemsAdded(listener: (items: I[]) => void): void;
        unItemsAdded(listener: (items: I[]) => void): void;
        private notifyItemsAdded(items);
        onItemsRemoved(listener: (items: I[]) => void): void;
        unItemsRemoved(listener: (items: I[]) => void): void;
        private notifyItemsRemoved(items);
    }
}
declare module api.ui.selector.combobox {
    class ComboBoxOptionFilterInput extends api.ui.selector.OptionFilterInput {
        constructor(placeholderText?: string);
        setMaximumReached(): void;
        getWidth(): number;
    }
}
declare module api.ui.selector.combobox {
    import Option = api.ui.selector.Option;
    class ComboBoxDropdown<OPTION_DISPLAY_VALUE> extends DropdownList<OPTION_DISPLAY_VALUE> {
        setOptions(options: Option<OPTION_DISPLAY_VALUE>[], noOptionsText: string, selectedOptions?: Option<OPTION_DISPLAY_VALUE>[], saveSelection?: boolean): void;
        getSelectedOptionCount(): number;
        toggleRowSelection(row: number, isMaximumReached?: boolean): void;
        resetActiveSelection(): void;
        onMultipleSelection(listener: (event: DropdownGridMultipleSelectionEvent) => void): void;
        unMultipleSelection(listener: (event: DropdownGridMultipleSelectionEvent) => void): void;
    }
}
declare module api.ui.selector.combobox {
    import Option = api.ui.selector.Option;
    import OptionFilterInputValueChangedEvent = api.ui.selector.OptionFilterInputValueChangedEvent;
    import Viewer = api.ui.Viewer;
    interface ComboBoxConfig<T> {
        iconUrl?: string;
        optionDisplayValueViewer?: Viewer<T>;
        selectedOptionsView: SelectedOptionsView<T>;
        maximumOccurrences?: number;
        filter?: (item: any, args: any) => boolean;
        hideComboBoxWhenMaxReached?: boolean;
        setNextInputFocusWhenMaxReached?: boolean;
        dataIdProperty?: string;
        delayedInputValueChangedHandling?: number;
        minWidth?: number;
        maxHeight?: number;
        value?: string;
        noOptionsText?: string;
        displayMissingSelectedOptions?: boolean;
        removeMissingSelectedOptions?: boolean;
        skipAutoDropShowOnValueChange?: boolean;
        treegridDropdownEnabled?: boolean;
        optionDataHelper?: OptionDataHelper<T>;
        optionDataLoader?: OptionDataLoader<T>;
        onDropdownShownCallback?: () => wemQ.Promise<void>;
    }
    enum PositionType {
        BELOW = 0,
        ABOVE = 1,
        FLEXIBLE_BELOW = 2,
        FLEXIBLE_ABOVE = 3,
    }
    interface DropdownPosition {
        position: PositionType;
        height: number;
    }
    class ComboBox<OPTION_DISPLAY_VALUE> extends api.dom.FormInputEl {
        private icon;
        private dropdownHandle;
        private applySelectionsButton;
        private input;
        private delayedInputValueChangedHandling;
        private delayedHandleInputValueChangedFnCall;
        private preservedInputValueChangedEvent;
        private selectedOptionsView;
        private comboBoxDropdown;
        private hideComboBoxWhenMaxReached;
        private setNextInputFocusWhenMaxReached;
        private ignoreNextFocus;
        private minWidth;
        private optionFilterInputValueChangedListeners;
        private expandedListeners;
        private valueLoadedListeners;
        private contentMissingListeners;
        private selectiondDelta;
        private noOptionsText;
        private displayMissingSelectedOptions;
        private removeMissingSelectedOptions;
        private skipAutoDropShowOnValueChange;
        private onDropdownShownCallback;
        static debug: boolean;
        /**
         * Indicates if combobox is currently has focus
         * @type {boolean}
         */
        private active;
        constructor(name: string, config: ComboBoxConfig<OPTION_DISPLAY_VALUE>);
        setReadOnly(readOnly: boolean): void;
        private doUpdateDropdownTopPositionAndWidth();
        private dropdownOverflowsBottom();
        private placeDropdownBelow();
        private placeDropdownAbove();
        private getScrollableParent(el);
        giveFocus(): boolean;
        giveInputFocus(): void;
        getComboBoxDropdownGrid(): DropdownGrid<OPTION_DISPLAY_VALUE>;
        isDropdownShown(): boolean;
        showDropdown(): void;
        setEmptyDropdownText(label: string): void;
        hideDropdown(): void;
        setOptions(options: Option<OPTION_DISPLAY_VALUE>[], saveSelection?: boolean): void;
        isInputEmpty(): boolean;
        addOption(option: Option<OPTION_DISPLAY_VALUE>): void;
        updateOption(option: Option<OPTION_DISPLAY_VALUE>, newOption: Option<OPTION_DISPLAY_VALUE>): void;
        setIgnoreNextFocus(value: boolean): ComboBox<OPTION_DISPLAY_VALUE>;
        isIgnoreNextFocus(): boolean;
        hasOptions(): boolean;
        getOptionCount(): number;
        getOptions(): Option<OPTION_DISPLAY_VALUE>[];
        getOptionByValue(value: string): Option<OPTION_DISPLAY_VALUE>;
        getOptionByRow(rowIndex: number): Option<OPTION_DISPLAY_VALUE>;
        setFilterArgs(args: any): void;
        protected doGetValue(): string;
        protected doSetValue(value: string, silent?: boolean): void;
        private selectExistingOptions(optionIds);
        private selectExistingAndHandleMissing(optionIds, missingOptionIds);
        private getMissingOptionsIds(values);
        protected splitValues(value: string): string[];
        handleRowSelected(index: number, keyCode?: number): void;
        isSelectionChanged(): boolean;
        selectRowOrApplySelection(index: number, keyCode?: number): void;
        selectOption(option: Option<OPTION_DISPLAY_VALUE>, silent?: boolean, keyCode?: number): void;
        isOptionSelected(option: Option<OPTION_DISPLAY_VALUE>): boolean;
        deselectOption(option: Option<OPTION_DISPLAY_VALUE>, silent?: boolean): void;
        clearSelection(ignoreEmpty?: boolean, giveInputFocus?: boolean, forceClear?: boolean): void;
        removeAllOptions(): void;
        getSelectedOptions(): Option<OPTION_DISPLAY_VALUE>[];
        getDisplayedOptions(): Option<OPTION_DISPLAY_VALUE>[];
        countSelectedOptions(): number;
        maximumOccurrencesReached(): boolean;
        maximumSelectionsReached(): boolean;
        setInputIconUrl(iconUrl: string): void;
        getInput(): ComboBoxOptionFilterInput;
        private setupListeners();
        private handleInputValueChanged();
        private handleKeyDown(event);
        private isSelectedRowReadOnly();
        private handleSelectedOptionRemoved();
        private handleSelectedOptionAdded();
        private handleSelectedOptionMoved();
        private handleMultipleSelectionChanged(event);
        private updateSelectionDelta();
        onOptionSelected(listener: (event: SelectedOptionEvent<OPTION_DISPLAY_VALUE>) => void): void;
        unOptionSelected(listener: (event: SelectedOptionEvent<OPTION_DISPLAY_VALUE>) => void): void;
        onOptionFilterInputValueChanged(listener: (event: OptionFilterInputValueChangedEvent<OPTION_DISPLAY_VALUE>) => void): void;
        unOptionFilterInputValueChanged(listener: (event: OptionFilterInputValueChangedEvent<OPTION_DISPLAY_VALUE>) => void): void;
        private notifyOptionFilterInputValueChanged(oldValue, newValue);
        onExpanded(listener: (event: api.ui.selector.DropdownExpandedEvent) => void): void;
        private notifyExpanded(expanded);
        onContentMissing(listener: (ids: string[]) => void): void;
        unContentMissing(listener: (ids: string[]) => void): void;
        private notifyContentMissing(ids);
        onValueLoaded(listener: (options: Option<OPTION_DISPLAY_VALUE>[]) => void): void;
        unValueLoaded(listener: (options: Option<OPTION_DISPLAY_VALUE>[]) => void): void;
        private notifyValueLoaded(options);
        onOptionDeselected(listener: {
            (removed: SelectedOptionEvent<OPTION_DISPLAY_VALUE>): void;
        }): void;
        unOptionDeselected(listener: {
            (removed: SelectedOptionEvent<OPTION_DISPLAY_VALUE>): void;
        }): void;
        onOptionMoved(listener: {
            (moved: SelectedOption<OPTION_DISPLAY_VALUE>): void;
        }): void;
        unOptionMoved(listener: {
            (moved: SelectedOption<OPTION_DISPLAY_VALUE>): void;
        }): void;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        onScrolled(listener: (event: WheelEvent) => void): void;
        onScroll(listener: (event: Event) => void): void;
    }
}
declare module api.ui.selector.combobox {
    interface SelectedOptionView<T> extends api.dom.Element {
        setOption(option: api.ui.selector.Option<T>): any;
        getOption(): api.ui.selector.Option<T>;
        onRemoveClicked(listener: {
            (): void;
        }): any;
        unRemoveClicked(listener: {
            (): void;
        }): any;
        setEditable(editable: boolean): any;
    }
}
declare module api.ui.selector.combobox {
    class BaseSelectedOptionView<T> extends api.dom.DivEl implements SelectedOptionView<T> {
        private option;
        private optionValueEl;
        private removeClickedListeners;
        private editable;
        constructor(option: api.ui.selector.Option<T>);
        setOption(option: api.ui.selector.Option<T>): void;
        getOption(): api.ui.selector.Option<T>;
        doRender(): wemQ.Promise<boolean>;
        protected notifyRemoveClicked(): void;
        onRemoveClicked(listener: {
            (): void;
        }): void;
        unRemoveClicked(listener: {
            (): void;
        }): void;
        setEditable(editable: boolean): void;
        isEditable(): boolean;
    }
}
declare module api.ui.selector.combobox {
    interface SelectedOptionsView<T> extends api.dom.DivEl {
        setMaximumOccurrences(value: number): any;
        getMaximumOccurrences(): number;
        createSelectedOption(option: api.ui.selector.Option<T>): SelectedOption<T>;
        addOption(option: api.ui.selector.Option<T>, silent: boolean, keyCode: number): boolean;
        updateOption(option: api.ui.selector.Option<T>, newOption: api.ui.selector.Option<T>, silent?: boolean): any;
        removeOption(optionToRemove: api.ui.selector.Option<T>, silent: boolean): any;
        count(): number;
        getSelectedOptions(): SelectedOption<T>[];
        getByOption(option: api.ui.selector.Option<T>): SelectedOption<T>;
        getById(id: string): SelectedOption<T>;
        getByIndex(index: number): SelectedOption<T>;
        isSelected(option: api.ui.selector.Option<T>): boolean;
        maximumOccurrencesReached(): boolean;
        moveOccurrence(formIndex: number, toIndex: number): any;
        onOptionSelected(listener: {
            (added: SelectedOptionEvent<T>): void;
        }): any;
        unOptionSelected(listener: {
            (added: SelectedOptionEvent<T>): void;
        }): any;
        onOptionDeselected(listener: {
            (removed: SelectedOptionEvent<T>): void;
        }): any;
        unOptionDeselected(listener: {
            (removed: SelectedOptionEvent<T>): void;
        }): any;
        onOptionMoved(listener: (moved: SelectedOption<T>) => void): any;
        unOptionMoved(listener: (moved: SelectedOption<T>) => void): any;
        setEditable(editable: boolean): any;
    }
}
declare module api.ui.selector.combobox {
    class BaseSelectedOptionsView<T> extends api.dom.DivEl implements SelectedOptionsView<T> {
        private list;
        private draggingIndex;
        private beforeDragStartedHeight;
        private maximumOccurrences;
        private optionRemovedListeners;
        private optionAddedListeners;
        private optionMovedListeners;
        private editable;
        constructor(className?: string);
        setEditable(editable: boolean): void;
        setOccurrencesSortable(sortable: boolean): void;
        refreshSortable(): void;
        private setSortable(sortable);
        protected handleDnDStart(event: Event, ui: JQueryUI.SortableUIParams): void;
        protected handleDnDUpdate(event: Event, ui: JQueryUI.SortableUIParams): void;
        protected handleDnDStop(event: Event, ui: JQueryUI.SortableUIParams): void;
        private handleMovedOccurrence(fromIndex, toIndex);
        setMaximumOccurrences(value: number): void;
        getMaximumOccurrences(): number;
        createSelectedOption(option: api.ui.selector.Option<T>): SelectedOption<T>;
        addOption(option: api.ui.selector.Option<T>, silent: boolean, keyCode: number): boolean;
        updateOption(optionToUpdate: api.ui.selector.Option<T>, newOption: api.ui.selector.Option<T>, silent?: boolean): void;
        removeOption(optionToRemove: api.ui.selector.Option<T>, silent?: boolean): void;
        count(): number;
        getSelectedOptions(): SelectedOption<T>[];
        getByIndex(index: number): SelectedOption<T>;
        getByOption(option: api.ui.selector.Option<T>): SelectedOption<T>;
        getById(id: string): SelectedOption<T>;
        isSelected(option: api.ui.selector.Option<T>): boolean;
        maximumOccurrencesReached(): boolean;
        moveOccurrence(fromIndex: number, toIndex: number): void;
        makeEmptyOption(id: string): Option<T>;
        protected notifyOptionDeselected(removed: SelectedOption<T>): void;
        onOptionDeselected(listener: {
            (removed: SelectedOptionEvent<T>): void;
        }): void;
        unOptionDeselected(listener: {
            (removed: SelectedOptionEvent<T>): void;
        }): void;
        onOptionSelected(listener: (added: SelectedOptionEvent<T>) => void): void;
        unOptionSelected(listener: (added: SelectedOptionEvent<T>) => void): void;
        protected notifyOptionSelected(added: SelectedOptionEvent<T>): void;
        onOptionMoved(listener: (moved: SelectedOption<T>) => void): void;
        unOptionMoved(listener: (moved: SelectedOption<T>) => void): void;
        protected notifyOptionMoved(moved: SelectedOption<T>): void;
    }
}
declare module api.ui.selector.combobox {
    class SelectedOption<T> {
        private optionView;
        private item;
        private index;
        constructor(optionView: SelectedOptionView<T>, index: number);
        getOption(): api.ui.selector.Option<T>;
        getOptionView(): SelectedOptionView<T>;
        getIndex(): number;
        setIndex(value: number): void;
    }
}
declare module api.ui.selector.combobox {
    class LoaderComboBox<OPTION_DISPLAY_VALUE> extends ComboBox<OPTION_DISPLAY_VALUE> {
        private loader;
        private tempValue;
        static debug: boolean;
        constructor(name: string, config: ComboBoxConfig<OPTION_DISPLAY_VALUE>, loader: api.util.loader.BaseLoader<any, OPTION_DISPLAY_VALUE>);
        setLoader(loader: api.util.loader.BaseLoader<any, OPTION_DISPLAY_VALUE>): void;
        protected doSetValue(value: string, silent?: boolean): void;
        protected doGetValue(): string;
        private doWhenLoaded(callback, value);
    }
}
declare module api.ui.selector.combobox {
    import Viewer = api.ui.Viewer;
    import SelectedOption = api.ui.selector.combobox.SelectedOption;
    import Option = api.ui.selector.Option;
    class RichComboBox<OPTION_DISPLAY_VALUE> extends api.dom.CompositeFormInputEl {
        protected loader: api.util.loader.BaseLoader<any, OPTION_DISPLAY_VALUE>;
        private selectedOptionsView;
        private comboBox;
        private errorContainer;
        private identifierMethod;
        private loadingListeners;
        private loadedListeners;
        private interval;
        private treegridDropdownEnabled;
        static debug: boolean;
        constructor(builder: RichComboBoxBuilder<OPTION_DISPLAY_VALUE>);
        private createCombobox(builder);
        private createComboboxConfig(builder);
        setReadOnly(readOnly: boolean): void;
        private handleLastRange(handler);
        setIgnoreNextFocus(value?: boolean): RichComboBox<OPTION_DISPLAY_VALUE>;
        isIgnoreNextFocus(): boolean;
        getSelectedDisplayValues(): OPTION_DISPLAY_VALUE[];
        getSelectedValues(): string[];
        getDisplayValues(): OPTION_DISPLAY_VALUE[];
        getSelectedOptions(): SelectedOption<OPTION_DISPLAY_VALUE>[];
        getSelectedOption(option: Option<OPTION_DISPLAY_VALUE>): SelectedOption<OPTION_DISPLAY_VALUE>;
        getSelectedOptionView(): SelectedOptionsView<OPTION_DISPLAY_VALUE>;
        isOptionSelected(option: Option<OPTION_DISPLAY_VALUE>): boolean;
        maximumOccurrencesReached(): boolean;
        getComboBox(): ComboBox<OPTION_DISPLAY_VALUE>;
        addOption(option: Option<OPTION_DISPLAY_VALUE>): void;
        updateOption(option: Option<OPTION_DISPLAY_VALUE>, displayValue: Object): void;
        selectOption(option: Option<OPTION_DISPLAY_VALUE>, silent?: boolean): void;
        selectOptionByValue(value: string, silent?: boolean): void;
        hasOptions(): boolean;
        getOptionCount(): number;
        getOptions(): Option<OPTION_DISPLAY_VALUE>[];
        getOptionByValue(value: string): Option<OPTION_DISPLAY_VALUE>;
        getOptionByRow(rowIndex: number): Option<OPTION_DISPLAY_VALUE>;
        countSelected(): number;
        select(value: OPTION_DISPLAY_VALUE, readOnly?: boolean, silent?: boolean): void;
        deselect(value: OPTION_DISPLAY_VALUE, silent?: boolean): void;
        clearCombobox(): void;
        clearSelection(forceClear?: boolean): void;
        removeAllOptions(): void;
        isSelected(value: OPTION_DISPLAY_VALUE): boolean;
        protected getDisplayValueId(value: Object): string;
        protected createOption(value: Object, readOnly?: boolean): Option<OPTION_DISPLAY_VALUE>;
        private isDataGridSelfLoading();
        private loadOptionsAfterShowDropdown();
        private setupLoader();
        private createOptions(items);
        getLoader(): api.util.loader.BaseLoader<any, OPTION_DISPLAY_VALUE>;
        setInputIconUrl(url: string): void;
        onOptionDeselected(listener: {
            (option: SelectedOptionEvent<OPTION_DISPLAY_VALUE>): void;
        }): void;
        unOptionDeselected(listener: {
            (removed: SelectedOptionEvent<OPTION_DISPLAY_VALUE>): void;
        }): void;
        onOptionSelected(listener: {
            (option: SelectedOptionEvent<OPTION_DISPLAY_VALUE>): void;
        }): void;
        unOptionSelected(listener: {
            (option: SelectedOptionEvent<OPTION_DISPLAY_VALUE>): void;
        }): void;
        onOptionMoved(listener: {
            (option: SelectedOption<OPTION_DISPLAY_VALUE>): void;
        }): void;
        unOptionMoved(listener: {
            (option: SelectedOption<OPTION_DISPLAY_VALUE>): void;
        }): void;
        private notifyLoading();
        onLoading(listener: {
            (): void;
        }): void;
        unLoading(listener: {
            (): void;
        }): void;
        onLoaded(listener: {
            (items: OPTION_DISPLAY_VALUE[], postLoaded?: boolean): void;
        }): void;
        unLoaded(listenerToBeRemoved: {
            (items: OPTION_DISPLAY_VALUE[], postLoaded?: boolean): void;
        }): void;
        private notifyLoaded(items, postLoaded?);
        onValueLoaded(listener: (options: Option<OPTION_DISPLAY_VALUE>[]) => void): void;
        unValueLoaded(listener: (options: Option<OPTION_DISPLAY_VALUE>[]) => void): void;
        giveFocus(): boolean;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
    class RichComboBoxBuilder<T> {
        comboBoxName: string;
        loader: api.util.loader.BaseLoader<any, T>;
        selectedOptionsView: SelectedOptionsView<T>;
        identifierMethod: string;
        maximumOccurrences: number;
        optionDisplayValueViewer: Viewer<T>;
        delayedInputValueChangedHandling: number;
        nextInputFocusWhenMaxReached: boolean;
        hideComboBoxWhenMaxReached: boolean;
        minWidth: number;
        maxHeight: number;
        value: string;
        noOptionsText: string;
        displayMissingSelectedOptions: boolean;
        removeMissingSelectedOptions: boolean;
        skipAutoDropShowOnValueChange: boolean;
        treegridDropdownEnabled: boolean;
        optionDataHelper: OptionDataHelper<any>;
        optionDataLoader: OptionDataLoader<any>;
        setComboBoxName(comboBoxName: string): RichComboBoxBuilder<T>;
        setIdentifierMethod(identifierMethod: string): RichComboBoxBuilder<T>;
        setLoader(loader: api.util.loader.BaseLoader<any, T>): RichComboBoxBuilder<T>;
        setSelectedOptionsView(selectedOptionsView: SelectedOptionsView<T>): RichComboBoxBuilder<T>;
        getSelectedOptionsView(): SelectedOptionsView<T>;
        setMaximumOccurrences(maximumOccurrences: number): RichComboBoxBuilder<T>;
        setOptionDisplayValueViewer(value: Viewer<T>): RichComboBoxBuilder<T>;
        setDelayedInputValueChangedHandling(value: number): RichComboBoxBuilder<T>;
        setNextInputFocusWhenMaxReached(value: boolean): RichComboBoxBuilder<T>;
        setHideComboBoxWhenMaxReached(value: boolean): RichComboBoxBuilder<T>;
        setMinWidth(value: number): RichComboBoxBuilder<T>;
        setMaxHeight(value: number): RichComboBoxBuilder<T>;
        setValue(value: string): RichComboBoxBuilder<T>;
        setNoOptionsText(value: string): RichComboBoxBuilder<T>;
        setDisplayMissingSelectedOptions(value: boolean): RichComboBoxBuilder<T>;
        setRemoveMissingSelectedOptions(value: boolean): RichComboBoxBuilder<T>;
        setSkipAutoDropShowOnValueChange(value: boolean): RichComboBoxBuilder<T>;
        setTreegridDropdownEnabled(value: boolean): RichComboBoxBuilder<T>;
        setOptionDataHelper(value: OptionDataHelper<any>): RichComboBoxBuilder<T>;
        setOptionDataLoader(value: OptionDataLoader<any>): RichComboBoxBuilder<T>;
        build(): RichComboBox<T>;
    }
}
declare module api.ui.selector.combobox {
    class RichSelectedOptionView<T> extends api.ui.selector.combobox.BaseSelectedOptionView<T> {
        private optionDisplayValue;
        private size;
        private draggable;
        private removable;
        private namesAndIconView;
        constructor(builder: RichSelectedOptionViewBuilder<T>);
        resolveIconUrl(content: T): string;
        resolveTitle(content: T): string;
        resolveSubTitle(content: T): string;
        resolveIconClass(content: T): string;
        protected createActionButtons(content: T): api.dom.Element[];
        protected isEditButtonNeeded(): boolean;
        protected createView(content: T): api.dom.Element;
        setOption(option: api.ui.selector.Option<T>): any;
        private setValues(values);
        protected createEditButton(content: T): api.dom.AEl;
        protected createRemoveButton(): api.dom.AEl;
        doRender(): wemQ.Promise<boolean>;
    }
    class RichSelectedOptionViewBuilder<T> {
        option: api.ui.selector.Option<T>;
        size: api.app.NamesAndIconViewSize;
        editable: boolean;
        draggable: boolean;
        removable: boolean;
        constructor(option: api.ui.selector.Option<T>);
        setEditable(value: boolean): RichSelectedOptionViewBuilder<T>;
        setDraggable(value: boolean): RichSelectedOptionViewBuilder<T>;
        setRemovable(value: boolean): RichSelectedOptionViewBuilder<T>;
        setSize(size: api.app.NamesAndIconViewSize): RichSelectedOptionViewBuilder<T>;
        build(): RichSelectedOptionView<T>;
    }
}
declare module api.ui.selector.combobox {
    class SelectedOptionEvent<T> {
        private selectedOption;
        private keyCode;
        constructor(selectedOption: SelectedOption<T>, keyCode?: number);
        getSelectedOption(): SelectedOption<T>;
        getKeyCode(): number;
    }
}
declare module api.ui.selector.dropdown {
    class DropdownOptionFilterInput extends api.ui.selector.OptionFilterInput {
        constructor(placeholderText?: string);
    }
}
declare module api.ui.selector.dropdown {
    class SelectedOptionView<T> extends api.dom.DivEl {
        private objectViewer;
        private optionValueEl;
        private option;
        private openDropdownListeners;
        constructor(objectViewer: Viewer<T>, skipExpandOnClick?: boolean);
        setOption(option: api.ui.selector.Option<T>): void;
        getOption(): api.ui.selector.Option<T>;
        private notifyOpenDropdown();
        resetOption(): void;
        onOpenDropdown(listener: {
            (): void;
        }): void;
        unOpenDropdown(listener: {
            (): void;
        }): void;
    }
}
declare module api.ui.selector.dropdown {
    import Option = api.ui.selector.Option;
    import OptionSelectedEvent = api.ui.selector.OptionSelectedEvent;
    import OptionFilterInputValueChangedEvent = api.ui.selector.OptionFilterInputValueChangedEvent;
    import Viewer = api.ui.Viewer;
    interface DropdownConfig<OPTION_DISPLAY_VALUE> {
        iconUrl?: string;
        optionDisplayValueViewer?: Viewer<OPTION_DISPLAY_VALUE>;
        filter?: (item: Option<OPTION_DISPLAY_VALUE>, args: any) => boolean;
        dataIdProperty?: string;
        value?: string;
        disableFilter?: boolean;
        skipExpandOnClick?: boolean;
        inputPlaceholderText?: string;
        noOptionsText?: string;
    }
    class Dropdown<OPTION_DISPLAY_VALUE> extends api.dom.FormInputEl {
        private icon;
        private typeAhead;
        private dropdownHandle;
        private input;
        private dropdownList;
        private optionDisplayValueViewer;
        private selectedOptionView;
        private optionSelectedListeners;
        private optionFilterInputValueChangedListeners;
        private expandedListeners;
        private noOptionsText;
        /**
         * Indicates if Dropdown currently has focus
         * @type {boolean}
         */
        private active;
        constructor(name: string, config: DropdownConfig<OPTION_DISPLAY_VALUE>);
        isValid(): boolean;
        setEmptyDropdownText(label: string): void;
        reset(): void;
        resetActiveSelection(): void;
        private defaultFilter(option, args);
        private doUpdateDropdownTopPositionAndWidth();
        giveFocus(): boolean;
        isDropdownShown(): boolean;
        showDropdown(): void;
        hideDropdown(): void;
        setOptions(options: Option<OPTION_DISPLAY_VALUE>[]): void;
        private isInputEmpty();
        removeAllOptions(): void;
        addOption(option: Option<OPTION_DISPLAY_VALUE>): void;
        hasOptions(): boolean;
        getOptionCount(): number;
        getOptions(): Option<OPTION_DISPLAY_VALUE>[];
        getOptionByValue(value: string): Option<OPTION_DISPLAY_VALUE>;
        getOptionByRow(rowIndex: number): Option<OPTION_DISPLAY_VALUE>;
        setValue(value: string): Dropdown<OPTION_DISPLAY_VALUE>;
        selectRow(index: number, silent?: boolean): void;
        selectOption(option: Option<OPTION_DISPLAY_VALUE>, silent?: boolean): void;
        getSelectedOption(): Option<OPTION_DISPLAY_VALUE>;
        getSelectedOptionView(): SelectedOptionView<OPTION_DISPLAY_VALUE>;
        getValue(): string;
        setInputIconUrl(iconUrl: string): void;
        private setupListeners();
        onOptionSelected(listener: (event: OptionSelectedEvent<OPTION_DISPLAY_VALUE>) => void): void;
        unOptionSelected(listener: (event: OptionSelectedEvent<OPTION_DISPLAY_VALUE>) => void): void;
        private notifyOptionSelected(item, previousItem);
        onOptionFilterInputValueChanged(listener: (event: OptionFilterInputValueChangedEvent<OPTION_DISPLAY_VALUE>) => void): void;
        unOptionFilterInputValueChanged(listener: (event: OptionFilterInputValueChangedEvent<OPTION_DISPLAY_VALUE>) => void): void;
        private notifyOptionFilterInputValueChanged(oldValue, newValue);
        onExpanded(listener: (event: api.ui.selector.DropdownExpandedEvent) => void): void;
        private notifyExpanded();
    }
}
declare module api.ui.selector.dropdown {
    import LoadedDataEvent = api.util.loader.event.LoadedDataEvent;
    class RichDropdown<OPTION_DISPLAY_VALUE> extends Dropdown<OPTION_DISPLAY_VALUE> {
        protected loader: api.util.loader.BaseLoader<any, OPTION_DISPLAY_VALUE>;
        constructor(dropdownConfig: DropdownConfig<OPTION_DISPLAY_VALUE>, name?: string);
        protected createLoader(): api.util.loader.BaseLoader<any, OPTION_DISPLAY_VALUE>;
        private initLoaderListeners();
        load(): void;
        protected getLoader(): api.util.loader.BaseLoader<any, OPTION_DISPLAY_VALUE>;
        showDropdown(): void;
        protected handleLoadedData(event: LoadedDataEvent<OPTION_DISPLAY_VALUE>): void;
        private createOptions(values);
        protected createOption(value: OPTION_DISPLAY_VALUE): Option<OPTION_DISPLAY_VALUE>;
    }
}
declare module api.ui.tags {
    interface TagSuggester {
        /**
         * Returns an array of suggestions based on given value.
         */
        suggest(value: string): wemQ.Promise<string[]>;
    }
}
declare module api.ui.tags {
    class TagBuilder {
        value: string;
        removable: boolean;
        setValue(value: string): TagBuilder;
        setRemovable(value: boolean): TagBuilder;
        build(): Tag;
    }
    class Tag extends api.dom.LiEl {
        private removeButtonEl;
        private valueHolderEl;
        private value;
        private removable;
        private removeClickListeners;
        constructor(builder: TagBuilder);
        getValue(): string;
        onRemoveClicked(listener: () => void): void;
        unRemoveClicked(listener: () => void): void;
        private notifyRemoveClicked();
    }
}
declare module api.ui.tags {
    class TagSuggestions extends api.dom.UlEl {
        private selectedIndex;
        private selectedListeners;
        constructor();
        setTags(values: string[]): void;
        moveDown(): void;
        moveUp(): void;
        private select(index);
        onSelected(listener: (value: string) => void): void;
        unSelected(listener: (value: string) => void): void;
        private notifySelected(value);
    }
}
declare module api.ui.tags {
    class TagAddedEvent {
        private value;
        constructor(value: string);
        getValue(): string;
    }
}
declare module api.ui.tags {
    class TagRemovedEvent {
        private value;
        private index;
        constructor(value: string, index: number);
        getValue(): string;
        getIndex(): number;
    }
}
declare module api.ui.tags {
    class TagsBuilder {
        tagSuggester: TagSuggester;
        tags: string[];
        maxTags: number;
        setTagSuggester(value: TagSuggester): TagsBuilder;
        addTag(value: string): TagsBuilder;
        setMaxTags(value: number): TagsBuilder;
        build(): Tags;
    }
    class Tags extends api.dom.FormInputEl {
        private tagSuggester;
        private textInput;
        private tagSuggestions;
        private tags;
        private maxTags;
        private preservedValue;
        private tagAddedListeners;
        private tagRemovedListeners;
        constructor(builder: TagsBuilder);
        private searchSuggestions(searchString);
        private handleWordCompleted();
        private doClearTags(silent?);
        private doAddTag(value, silent?);
        private doRemoveTag(tag, silent?);
        private indexOf(value);
        countTags(): number;
        protected doGetValue(): string;
        protected doSetValue(value: string, silent: boolean): void;
        private doGetTags();
        isMaxTagsReached(): boolean;
        onTagAdded(listener: (event: TagAddedEvent) => void): void;
        unTagAdded(listener: (event: TagAddedEvent) => void): void;
        private notifyTagAdded(event);
        onTagRemoved(listener: (event: TagRemovedEvent) => void): void;
        unTagRemoved(listener: (event: TagRemovedEvent) => void): void;
        giveFocus(): boolean;
        private notifyTagRemoved(event);
    }
}
declare module api.ui.geo {
    class GeoPoint extends api.ui.text.TextInput {
        private validUserInput;
        constructor(originalValue?: api.util.GeoPoint);
        setGeoPoint(value: api.util.GeoPoint): GeoPoint;
        getGeoPoint(): api.util.GeoPoint;
        isValid(): boolean;
    }
}
declare module api.ui.time {
    class DayOfWeek implements api.Equitable {
        private numberCode;
        private oneLetterName;
        private shortName;
        private fullName;
        private previous;
        private next;
        constructor(numberCode: number, oneLetterName: string, shortName: string, fullName: string);
        getNumberCode(): number;
        getOneLetterName(): string;
        getShortName(): string;
        getFullName(): string;
        getPrevioius(): DayOfWeek;
        getNext(): DayOfWeek;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.ui.time {
    class DaysOfWeek {
        static MONDAY: DayOfWeek;
        static TUESDAY: DayOfWeek;
        static WEDNESDAY: DayOfWeek;
        static THURSDAY: DayOfWeek;
        static FRIDAY: DayOfWeek;
        static SATURDAY: DayOfWeek;
        static SUNDAY: DayOfWeek;
        private static ALL;
        static getByNumberCode(value: number): DayOfWeek;
    }
}
declare module api.ui.time {
    class CalendarDayBuilder {
        date: Date;
        month: number;
        previousDay: CalendarDay;
        nextDay: CalendarDay;
        setDate(value: Date): CalendarDayBuilder;
        setMonth(value: number): CalendarDayBuilder;
        setPreviousDay(value: CalendarDay): CalendarDayBuilder;
        setNextDay(value: CalendarDay): CalendarDayBuilder;
        build(): CalendarDay;
    }
    class CalendarDay extends api.dom.LiEl implements api.Equitable {
        private date;
        private month;
        private dayOfWeek;
        private previousDay;
        private nextDay;
        private selectedDay;
        private calendarDayClickedListeners;
        constructor(builder: CalendarDayBuilder);
        getDate(): Date;
        getDayOfMonth(): number;
        setSelectedDay(value: boolean): void;
        refreshSelectedDay(): void;
        isInMonth(): boolean;
        isBeforeMonth(): boolean;
        isAfterMonth(): boolean;
        isLastDayOfMonth(month: number): boolean;
        getDayOfWeek(): DayOfWeek;
        getPrevious(): CalendarDay;
        getNext(): CalendarDay;
        equals(o: api.Equitable): boolean;
        onCalendarDayClicked(listener: (event: CalendarDayClickedEvent) => void): void;
        unCalendarDayClicked(listener: (event: CalendarDayClickedEvent) => void): void;
        private notifyCalendarDayClicked();
    }
}
declare module api.ui.time {
    class CalendarDayClickedEvent {
        private calendarDay;
        constructor(calendarDay: CalendarDay);
        getCalendarDay(): CalendarDay;
    }
}
declare module api.ui.time {
    class CalendarWeekBuilder {
        calendarDays: CalendarDay[];
        addDay(value: CalendarDay): CalendarWeekBuilder;
        build(): CalendarWeek;
    }
    class CalendarWeek extends api.dom.UlEl {
        private calendarDays;
        constructor(builder: CalendarWeekBuilder);
        hasLastDayOfMonth(month: number): boolean;
        getNextWeeksFirstDay(): CalendarDay;
    }
}
declare module api.ui.time {
    class SelectedDateChangedEvent {
        private date;
        constructor(selectedDate: Date);
        getDate(): Date;
    }
}
declare module api.ui.time {
    class CalendarBuilder {
        year: number;
        month: number;
        selectedDate: Date;
        startingDayOfWeek: DayOfWeek;
        interactive: boolean;
        setYear(value: number): CalendarBuilder;
        setMonth(value: number): CalendarBuilder;
        setSelectedDate(value: Date): CalendarBuilder;
        setStartingDayOfWeek(value: DayOfWeek): CalendarBuilder;
        setInteractive(value: boolean): CalendarBuilder;
        build(): Calendar;
    }
    class Calendar extends api.dom.DivEl {
        private interactive;
        private year;
        private month;
        private selectedDate;
        private calendarDays;
        private startingDayOfWeek;
        private weeks;
        private selectedDateChangedListeners;
        private shownMonthChangedListeners;
        constructor(builder: CalendarBuilder);
        selectDate(value: Date, silent?: boolean): void;
        nextMonth(): void;
        previousMonth(): void;
        nextYear(): void;
        previousYear(): void;
        private renderMonth();
        private resolveDaysInMonth();
        private resolveFirstDayOfCalendar();
        private createCalendarWeeks(firstDay);
        private createCalendarWeek(firstDayOfWeek);
        private createCalendarDay(dayOfMonth, previousDay);
        private handleCalendarDayClicked(event);
        getSelectedDate(): Date;
        getMonth(): number;
        getYear(): number;
        getCalendarDays(): CalendarDay[];
        onSelectedDateChanged(listener: (event: SelectedDateChangedEvent) => void): void;
        unSelectedDateChanged(listener: (event: SelectedDateChangedEvent) => void): void;
        private notifySelectedDateChanged(date);
        onShownMonthChanged(listener: (month: number, year: number) => void): void;
        unShownMonthChanged(listener: (month: number, year: number) => void): void;
        private notifyShownMonthChanged(month, year);
    }
}
declare module api.ui.time {
    class Picker extends api.dom.DivEl {
        protected popup: any;
        protected input: api.ui.text.TextInput;
        protected validUserInput: boolean;
        constructor(builder: any, className?: string);
        private setupCommonListeners();
        resetBase(): void;
        protected handleShownEvent(): void;
        protected initData(builder: any): void;
        protected initPopup(builder: any): void;
        protected initInput(builder: any): void;
        protected wrapChildrenAndAppend(): void;
        protected setupListeners(builder: any): void;
        protected togglePopupVisibility(): void;
        getTextInput(): api.ui.text.TextInput;
        isDirty(): boolean;
        isValid(): boolean;
        updateInputStyling(): void;
        giveFocus(): boolean;
    }
}
declare module api.ui.time {
    class DatePickerBuilder {
        year: number;
        month: number;
        selectedDate: Date;
        calendar: Calendar;
        startingDayOfWeek: DayOfWeek;
        closeOnSelect: boolean;
        setYear(value: number): DatePickerBuilder;
        setMonth(value: number): DatePickerBuilder;
        setSelectedDate(value: Date): DatePickerBuilder;
        setCalendar(value: Calendar): DatePickerBuilder;
        setStartingDayOfWeek(value: DayOfWeek): DatePickerBuilder;
        setCloseOnSelect(value: boolean): DatePickerBuilder;
        build(): DatePicker;
    }
    class DatePicker extends Picker {
        private calendar;
        private selectedDate;
        private selectedDateChangedListeners;
        constructor(builder: DatePickerBuilder);
        protected initData(builder: DatePickerBuilder): void;
        private initCalendar(builder);
        protected handleShownEvent(): void;
        protected initPopup(): void;
        protected initInput(builder: DatePickerBuilder): void;
        protected setupListeners(builder: DatePickerBuilder): void;
        private onDatePickerShown(event);
        setSelectedDate(date: Date): void;
        getSelectedDate(): Date;
        onSelectedDateChanged(listener: (event: SelectedDateChangedEvent) => void): void;
        unSelectedDateChanged(listener: (event: SelectedDateChangedEvent) => void): void;
        private notifySelectedDateChanged(event);
        private formatDate(date);
    }
    class DatePickerShownEvent extends api.event.Event {
        private datePicker;
        constructor(datePicker: DatePicker);
        getDatePicker(): DatePicker;
        static on(handler: (event: DatePickerShownEvent) => void): void;
        static un(handler?: (event: DatePickerShownEvent) => void): void;
    }
}
declare module api.ui.time {
    class DatePickerPopupBuilder {
        calendar: Calendar;
        setCalendar(value: Calendar): DatePickerPopupBuilder;
        getCalendar(): Calendar;
        build(): DatePickerPopup;
    }
    class DatePickerPopup extends api.dom.DivEl {
        private prevYear;
        private year;
        private nextYear;
        private prevMonth;
        private month;
        private nextMonth;
        private calendar;
        constructor(builder: DatePickerPopupBuilder);
        getSelectedDate(): Date;
        setSelectedDate(date: Date, silent?: boolean): void;
        onSelectedDateChanged(listener: (event: SelectedDateChangedEvent) => void): void;
        unSelectedDateChanged(listener: (event: SelectedDateChangedEvent) => void): void;
    }
}
declare module api.ui.time {
    class MonthOfYear implements api.Equitable {
        private numberCode;
        private oneLetterName;
        private shortName;
        private fullName;
        private previous;
        private next;
        constructor(numberCode: number, oneLetterName: string, shortName: string, fullName: string);
        getNumberCode(): number;
        getOneLetterName(): string;
        getShortName(): string;
        getFullName(): string;
        getPrevioius(): MonthOfYear;
        getNext(): MonthOfYear;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.ui.time {
    class MonthsOfYear {
        static JANUARY: MonthOfYear;
        static FEBRUARY: MonthOfYear;
        static MARCH: MonthOfYear;
        static APRIL: MonthOfYear;
        static MAY: MonthOfYear;
        static JUNE: MonthOfYear;
        static JULY: MonthOfYear;
        static AUGUST: MonthOfYear;
        static SEPTEMBER: MonthOfYear;
        static OCTOBER: MonthOfYear;
        static NOVEMBER: MonthOfYear;
        static DECEMBER: MonthOfYear;
        private static monthsByCode;
        static getByNumberCode(code: number): MonthOfYear;
    }
}
declare module api.ui.time {
    class TimePickerBuilder {
        hours: number;
        minutes: number;
        setHours(value: number): TimePickerBuilder;
        setMinutes(value: number): TimePickerBuilder;
        build(): TimePicker;
    }
    class TimePicker extends Picker {
        constructor(builder: TimePickerBuilder);
        protected initPopup(builder: TimePickerBuilder): void;
        protected initInput(builder: TimePickerBuilder): void;
        protected setupListeners(builder: TimePickerBuilder): void;
        setSelectedTime(hour: number, minute: number): void;
        getSelectedTime(): {
            hour: number;
            minute: number;
        };
        onSelectedTimeChanged(listener: (hours: number, minutes: number) => void): void;
        unSelectedTimeChanged(listener: (hours: number, minutes: number) => void): void;
        formatTime(hours: number, minutes: number): string;
    }
}
declare module api.ui.time {
    import Timezone = api.util.Timezone;
    class TimePickerPopupBuilder {
        hours: number;
        minutes: number;
        timezone: Timezone;
        useLocalTimezoneIfNotPresent: boolean;
        setHours(value: number): TimePickerPopupBuilder;
        getHours(): number;
        setMinutes(value: number): TimePickerPopupBuilder;
        getMinutes(): number;
        setTimezone(value: Timezone): TimePickerPopupBuilder;
        getTimezone(): Timezone;
        setUseLocalTimezoneIfNotPresent(value: boolean): TimePickerPopupBuilder;
        isUseLocalTimezoneIfNotPresent(): boolean;
        build(): TimePickerPopup;
    }
    class TimePickerPopup extends api.dom.UlEl {
        private nextHour;
        private hour;
        private prevHour;
        private nextMinute;
        private minute;
        private prevMinute;
        private timezoneOffset;
        private timezoneLocation;
        private selectedHour;
        private selectedMinute;
        private interval;
        private timezone;
        private useLocalTimezoneIfNotPresent;
        private timeChangedListeners;
        constructor(builder: TimePickerPopupBuilder);
        getSelectedTime(): {
            hour: number;
            minute: number;
        };
        onSelectedTimeChanged(listener: (hours: number, minutes: number) => void): void;
        unSelectedTimeChanged(listener: (hours: number, minutes: number) => void): void;
        private startInterval(fn, ...args);
        private stopInterval();
        private getUTCString(value);
        private addHour(add, silent?);
        private addMinute(add, silent?);
        private notifyTimeChanged(hours, minutes);
        setSelectedTime(hours: number, minutes: number, silent?: boolean): void;
        padNumber(value: number, pad: number): string;
        isHoursValid(hours: number): boolean;
        isMinutesValid(minutes: number): boolean;
    }
}
declare module api.ui.time {
    import Timezone = api.util.Timezone;
    class DateTimePickerBuilder {
        year: number;
        month: number;
        selectedDate: Date;
        hours: number;
        minutes: number;
        startingDayOfWeek: DayOfWeek;
        closeOnSelect: boolean;
        timezone: Timezone;
        useLocalTimezoneIfNotPresent: boolean;
        setYear(value: number): DateTimePickerBuilder;
        setMonth(value: number): DateTimePickerBuilder;
        setSelectedDate(value: Date): DateTimePickerBuilder;
        setHours(value: number): DateTimePickerBuilder;
        setMinutes(value: number): DateTimePickerBuilder;
        setStartingDayOfWeek(value: DayOfWeek): DateTimePickerBuilder;
        setTimezone(value: Timezone): DateTimePickerBuilder;
        setCloseOnSelect(value: boolean): DateTimePickerBuilder;
        setUseLocalTimezoneIfNotPresent(value: boolean): DateTimePickerBuilder;
        build(): DateTimePicker;
    }
    class DateTimePicker extends Picker {
        private selectedDate;
        private selectedDateTimeChangedListeners;
        constructor(builder: DateTimePickerBuilder);
        protected initData(builder: DateTimePickerBuilder): void;
        protected handleShownEvent(): void;
        protected initInput(): void;
        protected initPopup(builder: DateTimePickerBuilder): void;
        protected wrapChildrenAndAppend(): void;
        protected setupListeners(builder: DateTimePickerBuilder): void;
        private onDateTimePickerShown(event);
        setSelectedDateTime(date: Date): void;
        private setDateTime(date);
        private setInputValue();
        private setTime(hours, minutes);
        private setDate(date);
        getSelectedDateTime(): Date;
        onSelectedDateTimeChanged(listener: (event: SelectedDateChangedEvent) => void): void;
        unSelectedDateTimeChanged(listener: (event: SelectedDateChangedEvent) => void): void;
        private notifySelectedDateTimeChanged(event);
        private formatDateTime(date);
    }
    class DateTimePickerShownEvent extends api.event.Event {
        private dateTimePicker;
        constructor(dateTimePicker: DateTimePicker);
        getDateTimePicker(): DateTimePicker;
        static on(handler: (event: DateTimePickerShownEvent) => void): void;
        static un(handler?: (event: DateTimePickerShownEvent) => void): void;
    }
}
declare module api.ui.time {
    import Timezone = api.util.Timezone;
    class DateTimePickerPopupBuilder {
        hours: number;
        minutes: number;
        calendar: Calendar;
        timezone: Timezone;
        useLocalTimezoneIfNotPresent: boolean;
        setHours(value: number): DateTimePickerPopupBuilder;
        getHours(): number;
        setMinutes(value: number): DateTimePickerPopupBuilder;
        getMinutes(): number;
        setCalendar(value: Calendar): DateTimePickerPopupBuilder;
        getCalendar(): Calendar;
        setTimezone(value: Timezone): DateTimePickerPopupBuilder;
        setUseLocalTimezoneIfNotPresent(value: boolean): DateTimePickerPopupBuilder;
        isUseLocalTimezoneIfNotPresent(): boolean;
        getTimezone(): Timezone;
        build(): DateTimePickerPopup;
    }
    class DateTimePickerPopup extends api.dom.DivEl {
        private datePickerPopup;
        private timePickerPopup;
        constructor(builder: DateTimePickerPopupBuilder);
        getSelectedDate(): Date;
        onSelectedDateChanged(listener: (event: SelectedDateChangedEvent) => void): void;
        unSelectedDateChanged(listener: (event: SelectedDateChangedEvent) => void): void;
        getSelectedTime(): {
            hour: number;
            minute: number;
        };
        onSelectedTimeChanged(listener: (hours: number, minutes: number) => void): void;
        unSelectedTimeChanged(listener: (hours: number, minutes: number) => void): void;
        getSelectedDateTime(): Date;
        setSelectedTime(hours: number, minutes: number, silent?: boolean): void;
        setSelectedDate(date: Date, silent?: boolean): void;
    }
}
declare module api.form {
    import DateTimePicker = api.ui.time.DateTimePicker;
    class LocalDateTimeFormInput extends api.dom.FormInputEl {
        private localDate;
        constructor(value?: Date);
        doGetValue(): string;
        protected doSetValue(value: string, silent?: boolean): void;
        getPicker(): DateTimePicker;
    }
}
declare module api.ui.image {
    import ImgEl = api.dom.ImgEl;
    class ImageCanvas extends api.dom.DivEl {
        private image;
        private zoom;
        private pan;
        private enabled;
        private suspendRender;
        private imageRatio;
        private canvasWidth;
        private canvasHeight;
        private zoomChangeListeners;
        private panChangeListeners;
        constructor(image: ImgEl);
        setPan(x: number, y: number, override?: boolean): void;
        getPan(): {
            x: number;
            y: number;
        };
        setZoom(value: number, override?: boolean, x?: number, y?: number): void;
        getZoom(): number;
        setEnabled(isEnabled: boolean): void;
        isEnabled(): boolean;
        private renderCanvas();
        private disableCanvas();
        private enableCanvas();
        private recalculateHeight(updateWidth, updateRatio);
        onZoomChanged(listener: (zoom: number) => void): void;
        unZoomChanged(listener: (zoom: number) => void): void;
        private notifyZoomChanged(zoom);
        onPanChanged(listener: (x: number, y: number) => void): void;
        unPanChanged(listener: (x: number, y: number) => void): void;
        private notifyPanChanged(x, y);
    }
}
declare module api.ui.image {
    import ImgEl = api.dom.ImgEl;
    import Element = api.dom.Element;
    interface Point {
        x: number;
        y: number;
    }
    interface Rect extends Point {
        x2: number;
        y2: number;
    }
    class ImageEditor extends api.dom.DivEl {
        private SCROLLABLE_SELECTOR;
        private WIZARD_TOOLBAR_SELECTOR;
        private frame;
        private canvas;
        private image;
        private clip;
        private dragHandle;
        private zoomContainer;
        private zoomLine;
        private zoomKnob;
        private focusClipPath;
        private cropClipPath;
        private focusData;
        private revertFocusData;
        private cropData;
        private revertCropData;
        private zoomData;
        private revertZoomData;
        private imgW;
        private imgH;
        private frameW;
        private frameH;
        private maxZoom;
        private mouseUpListener;
        private mouseMoveListener;
        private mouseDownListener;
        private dragMouseDownListener;
        private knobMouseDownListener;
        private stickyToolbar;
        private editCropButton;
        private editFocusButton;
        private editResetButton;
        private uploadButton;
        private editModeListeners;
        private focusPositionChangedListeners;
        private autoFocusChangedListeners;
        private focusRadiusChangedListeners;
        private cropPositionChangedListeners;
        private autoCropChangedListeners;
        private shaderVisibilityChangedListeners;
        private maskWheelListener;
        private maskClickListener;
        private maskHideListener;
        private imageErrorListeners;
        private skipNextOutsideClick;
        static debug: boolean;
        constructor(src?: string);
        isElementInsideButtonsContainer(el: HTMLElement): boolean;
        getLastButtonInContainer(): Element;
        remove(): ImageEditor;
        setSrc(src: string): void;
        getSrc(): string;
        getImage(): ImgEl;
        getUploadButton(): api.dom.ButtonEl;
        private setImageClipPath(path);
        /**
         * Converts point from px to %
         * @param point point object to normalize
         * @returns {Point} normalized to 0-1 point
         */
        private normalizePoint(point);
        /**
         * Converts point from % to px
         * @param x
         * @param y
         * @returns {Point} denormalized point
         */
        private denormalizePoint(x, y);
        /**
         * Converts rectangle from px to %
         * @param rect rectangle object to normalize
         * @returns {SVGRect} normalized to 0-1 rectangle
         */
        private normalizeRect(rect);
        /**
         * Converts rectangle from % to px
         * @param rect
         * @returns {SVGRect} denormalized rectangle
         */
        private denormalizeRect(rect);
        /**
         * Converts radius from px to % of the smallest dimension
         * @param r
         * @returns {number} normalized to 0-1 radius
         */
        private normalizeRadius(r);
        /**
         * Converts radius from % of the smallest dimension to px
         * @param r
         * @returns {number} denormalized radius
         */
        private denormalizeRadius(r);
        private getOffsetX(e);
        private getOffsetY(e);
        private isImageLoaded();
        private updateImageDimensions(reset?, scale?);
        private updateFrameHeight();
        private isOutside(event);
        private setShaderVisible(visible);
        private WHEEL_PIXEL_STEP;
        private WHEEL_LINE_HEIGHT;
        private WHEEL_PAGE_HEIGHT;
        private normalizeWheel(event);
        private createStickyToolbar();
        private updateStickyToolbar();
        private createZoomContainer();
        private isTopEdgeVisible(relativeScrollTop);
        private isBottomEdgeVisible(relativeScrollTop);
        private getRelativeScrollTop();
        private setEditMode(edit, applyChanges?);
        isEditMode(): boolean;
        private enableFocusEditMode(applyChanges?, enterEditMode?);
        private disableFocusEditMode(applyChanges?, exitEditMode?);
        private setFocusEditMode(edit);
        isFocusEditMode(): boolean;
        /**
         * Sets the center of the focal point
         * @param x horizontal value in 0-1 interval
         * @param y vertical value in 0-1 interval
         * @returns {undefined}
         */
        setFocusPosition(x: number, y: number): void;
        private setFocusPositionPx(position, updateAuto?);
        /**
         * Returns the center of the focal point as 0-1 values
         * @returns {{x, y}|Point}
         */
        getFocusPosition(): Point;
        private getFocusPositionPx();
        resetFocusPosition(): void;
        resetFocusRadius(): void;
        setFocusRadius(r: number): void;
        private setFocusRadiusPx(r, updateAuto?);
        /**
         * Returns the radius normalized by smallest dimension either image or frame
         * @returns {number}
         */
        getFocusRadius(): number;
        private getFocusRadiusPx();
        private setFocusAutoPositioned(auto);
        private bindFocusMouseListeners();
        private unbindFocusMouseListeners();
        private updateFocusMaskPosition();
        private restrainFocusX(x);
        private restrainFocusY(y);
        private restrainFocusRadius(r);
        private isFocusNotModified(focus);
        private isFocusPositionNotModified(focus);
        private isFocusRadiusNotModified(r);
        private enableCropEditMode(applyChanges?, enterEditMode?);
        private disableCropEditMode(applyChanges?, exitEditMode?);
        private setCropEditMode(edit);
        isCropEditMode(): boolean;
        /**
         * Sets the crop area
         * @param x
         * @param y
         * @param w
         * @param h
         */
        setCropPosition(x: number, y: number, x2: number, y2: number): void;
        private setCropPositionPx(crop, updateAuto?);
        getCropPosition(): Rect;
        private getCropPositionPx();
        resetCropPosition(): void;
        private setCropAutoPositioned(auto);
        private updateCropMaskPosition();
        private isInsideCrop(x, y);
        private bindCropMouseListeners();
        private unbindCropMouseListeners();
        /**
         * Crop coordinate system starts in the top left corner of the zoom rectangle
         * @param x
         * @returns {number}
         */
        private restrainCropX(x);
        private restrainCropY(y);
        private restrainCropW(x);
        private restrainCropH(y);
        private rectFromSVG(svg);
        private rectToSVG(x, y, x2, y2);
        private isCropNotModified(rect);
        setZoomPosition(x: number, y: number, x2: number, y2: number): void;
        private setZoomPositionPx(zoom, updateAuto?);
        getZoomPosition(): Rect;
        private getZoomPositionPx();
        resetZoomPosition(): void;
        private isInsideZoom(x, y);
        private moveZoomKnobByPx(delta);
        private updateZoomPosition();
        private updateRevertCropData();
        private updateRevertZoomData();
        private updateRevertFocusData();
        /**
         * Zoom coordinates system starts in the top left corner of the original image
         * @param x
         * @returns {number}
         */
        private restrainZoomX(x);
        private restrainZoomY(y);
        private restrainZoomW(x);
        private restrainZoomH(y);
        onEditModeChanged(listener: (edit: boolean, position: Rect, zoom: Rect, focus: Point) => void): void;
        unEditModeChanged(listener: (edit: boolean, position: Rect, zoom: Rect, focus: Point) => void): void;
        private notifyEditModeChanged(edit, position, zoom, focus);
        onFocusAutoPositionedChanged(listener: (auto: boolean) => void): void;
        unFocusAutoPositionedChanged(listener: (auto: boolean) => void): void;
        private notifyFocusAutoPositionedChanged(auto);
        onFocusPositionChanged(listener: (position: Point) => void): void;
        unFocusPositionChanged(listener: (position: Point) => void): void;
        private notifyFocusPositionChanged(position);
        onFocusRadiusChanged(listener: (r: number) => void): void;
        unFocusRadiusChanged(listener: (r: number) => void): void;
        private notifyFocusRadiusChanged(r);
        onCropAutoPositionedChanged(listener: (auto: boolean) => void): void;
        unCropAutoPositionedChanged(listener: (auto: boolean) => void): void;
        private notifyCropAutoPositionedChanged(auto);
        onCropPositionChanged(listener: (position: Rect) => void): void;
        unCropPositionChanged(listener: (position: Rect) => void): void;
        private notifyCropPositionChanged(position);
        onShaderVisibilityChanged(listener: (auto: boolean) => void): void;
        unShaderVisibilityChanged(listener: (auto: boolean) => void): void;
        private notifyShaderVisibilityChanged(auto);
        onImageError(listener: (event: UIEvent) => void): void;
        unImageError(listener: (event: UIEvent) => void): void;
        private notifyImageError(event);
    }
}
declare module api.ui.image {
    class LazyImage extends api.dom.DivEl {
        private phantomImage;
        constructor(src?: string);
        setSrc(src: string): void;
    }
}
declare module api.ui.security {
    import Principal = api.security.Principal;
    import User = api.security.User;
    class PrincipalViewer extends api.ui.NamesAndIconViewer<Principal> {
        private removeClickedListeners;
        constructor();
        resolveDisplayName(object: Principal): string;
        resolveUnnamedDisplayName(object: Principal): string;
        resolveSubName(object: Principal, relativePath?: boolean): string;
        resolveIconClass(object: Principal): string;
        onRemoveClicked(listener: (event: MouseEvent) => void): void;
        unRemoveClicked(listener: (event: MouseEvent) => void): void;
        notifyRemoveClicked(event: MouseEvent): void;
    }
    class PrincipalViewerCompact extends api.ui.Viewer<Principal> {
        private currentUser;
        constructor();
        doLayout(principal: Principal): void;
        setCurrentUser(user: User): void;
    }
}
declare module api.ui.security {
    import Option = api.ui.selector.Option;
    import Principal = api.security.Principal;
    import PrincipalLoader = api.security.PrincipalLoader;
    import SelectedOption = api.ui.selector.combobox.SelectedOption;
    import BaseSelectedOptionsView = api.ui.selector.combobox.BaseSelectedOptionsView;
    import SelectedOptionView = api.ui.selector.combobox.SelectedOptionView;
    import RichComboBox = api.ui.selector.combobox.RichComboBox;
    class PrincipalComboBox extends RichComboBox<Principal> {
        constructor(builder: PrincipalComboBoxBuilder);
        static create(): PrincipalComboBoxBuilder;
    }
    class PrincipalComboBoxBuilder {
        loader: PrincipalLoader;
        maxOccurrences: number;
        value: string;
        displayMissing: boolean;
        compactView: boolean;
        setLoader(value: PrincipalLoader): PrincipalComboBoxBuilder;
        setMaxOccurences(value: number): PrincipalComboBoxBuilder;
        setValue(value: string): PrincipalComboBoxBuilder;
        setDisplayMissing(value: boolean): PrincipalComboBoxBuilder;
        setCompactView(value: boolean): PrincipalComboBoxBuilder;
        build(): PrincipalComboBox;
    }
    class PrincipalSelectedOptionView extends PrincipalViewer implements SelectedOptionView<Principal> {
        private option;
        constructor(option: Option<Principal>);
        setEditable(editable: boolean): void;
        setOption(option: api.ui.selector.Option<Principal>): void;
        getOption(): api.ui.selector.Option<Principal>;
    }
    class PrincipalSelectedOptionsView extends BaseSelectedOptionsView<Principal> {
        constructor();
        createSelectedOption(option: Option<Principal>, isEmpty?: boolean): SelectedOption<Principal>;
        makeEmptyOption(id: string): Option<Principal>;
    }
    class RemovedPrincipalSelectedOptionView extends PrincipalSelectedOptionView {
        constructor(option: Option<Principal>);
        resolveSubName(object: Principal, relativePath?: boolean): string;
    }
    class PrincipalSelectedOptionViewCompact extends PrincipalViewerCompact implements SelectedOptionView<Principal> {
        private option;
        constructor(option: Option<Principal>);
        setEditable(editable: boolean): void;
        setOption(option: api.ui.selector.Option<Principal>): void;
        getOption(): api.ui.selector.Option<Principal>;
        onRemoveClicked(listener: (event: MouseEvent) => void): void;
        unRemoveClicked(listener: (event: MouseEvent) => void): void;
    }
    class PrincipalSelectedOptionsViewCompact extends BaseSelectedOptionsView<Principal> {
        private currentUser;
        constructor();
        private loadCurrentUser();
        createSelectedOption(option: Option<Principal>, isEmpty?: boolean): SelectedOption<Principal>;
    }
}
declare module api.ui.security.acl {
    enum Access {
        FULL = 0,
        READ = 1,
        WRITE = 2,
        PUBLISH = 3,
        CUSTOM = 4,
    }
}
declare module api.ui.security.acl {
    class AccessSelector extends api.ui.tab.TabMenu {
        private static OPTIONS;
        private value;
        private valueChangedListeners;
        constructor();
        initEventHandlers(): void;
        getValue(): Access;
        setValue(value: Access, silent?: boolean): AccessSelector;
        protected setButtonLabel(value: string): AccessSelector;
        private findOptionByValue(value);
        showMenu(): void;
        onValueChanged(listener: (event: api.ValueChangedEvent) => void): void;
        unValueChanged(listener: (event: api.ValueChangedEvent) => void): void;
        private notifyValueChanged(event);
        giveFocusToMenu(): boolean;
        isKeyNext(event: KeyboardEvent): boolean;
        isKeyPrevious(event: KeyboardEvent): boolean;
        returnFocusFromMenu(): boolean;
        focus(): boolean;
    }
}
declare module api.ui.security.acl {
    import Permission = api.security.acl.Permission;
    import PermissionState = api.security.acl.PermissionState;
    interface PermissionSelectorOption {
        value: Permission;
        name: string;
    }
    class PermissionSelector extends api.dom.DivEl {
        private toggles;
        private oldValue;
        private valueChangedListeners;
        private enabled;
        private static OPTIONS;
        constructor();
        setEnabled(enabled: boolean): PermissionSelector;
        isEnabled(): boolean;
        getValue(): {
            allow: Permission[];
            deny: Permission[];
        };
        setValue(newValue: {
            allow: Permission[];
            deny: Permission[];
        }, silent?: boolean): PermissionSelector;
        onValueChanged(listener: (event: api.ValueChangedEvent) => void): void;
        unValueChanged(listener: (event: api.ValueChangedEvent) => void): void;
        notifyValueChanged(event: api.ValueChangedEvent): void;
    }
    class PermissionToggle extends api.dom.AEl {
        private static STATES;
        private valueChangedListeners;
        private originalStateIndex;
        private stateIndex;
        private value;
        private enabled;
        constructor(option: PermissionSelectorOption, state?: PermissionState);
        setEnabled(enabled: boolean): PermissionToggle;
        isEnabled(): boolean;
        getValue(): Permission;
        getState(): PermissionState;
        setState(newState: PermissionState, silent?: boolean): PermissionToggle;
        onValueChanged(listener: (event: api.ValueChangedEvent) => void): void;
        unValueChanged(listener: (event: api.ValueChangedEvent) => void): void;
        private notifyValueChanged(event);
    }
}
declare module api.ui.security.acl {
    import Principal = api.security.Principal;
    import AccessControlEntry = api.security.acl.AccessControlEntry;
    class AccessControlEntryView extends api.ui.security.PrincipalViewer {
        private ace;
        private accessSelector;
        private permissionSelector;
        private removeButton;
        private valueChangedListeners;
        private editable;
        static debug: boolean;
        constructor(ace: AccessControlEntry);
        doLayout(object: Principal): void;
        getPermissionSelector(): PermissionSelector;
        getValueChangedListeners(): {
            (item: AccessControlEntry): void;
        }[];
        setEditable(editable: boolean): void;
        isEditable(): boolean;
        onValueChanged(listener: (item: AccessControlEntry) => void): void;
        unValueChanged(listener: (item: AccessControlEntry) => void): void;
        notifyValueChanged(item: AccessControlEntry): void;
        setAccessControlEntry(ace: AccessControlEntry, silent?: boolean): void;
        getAccessControlEntry(): AccessControlEntry;
        static getAccessValueFromEntry(ace: AccessControlEntry): Access;
        private static canRead(allowed);
        private static canOnlyRead(allowed);
        private static canWrite(allowed);
        private static canOnlyWrite(allowed);
        private static canPublish(allowed);
        private static canOnlyPublish(allowed);
        private static isFullAccess(allowed);
        private static onlyFullAccess(allowed);
        private getPermissionsValueFromAccess(access);
    }
}
declare module api.ui.security.acl {
    import AccessControlEntry = api.security.acl.AccessControlEntry;
    class AccessControlListView extends api.ui.selector.list.ListBox<AccessControlEntry> {
        private itemValueChangedListeners;
        private itemsEditable;
        constructor(className?: string);
        createItemView(entry: AccessControlEntry): AccessControlEntryView;
        getItemId(item: AccessControlEntry): string;
        onItemValueChanged(listener: (item: AccessControlEntry) => void): void;
        unItemValueChanged(listener: (item: AccessControlEntry) => void): void;
        notifyItemValueChanged(item: AccessControlEntry): void;
        setItemsEditable(editable: boolean): AccessControlListView;
        isItemsEditable(): boolean;
    }
}
declare module api.ui.security.acl {
    import AccessControlEntry = api.security.acl.AccessControlEntry;
    class AccessControlEntryViewer extends api.ui.NamesAndIconViewer<AccessControlEntry> {
        constructor();
        resolveDisplayName(object: AccessControlEntry): string;
        resolveUnnamedDisplayName(object: AccessControlEntry): string;
        resolveSubName(object: AccessControlEntry, relativePath?: boolean): string;
        resolveIconClass(object: AccessControlEntry): string;
    }
}
declare module api.ui.security.acl {
    import AccessControlEntry = api.security.acl.AccessControlEntry;
    class AccessControlComboBox extends api.ui.selector.combobox.RichComboBox<AccessControlEntry> {
        private aceSelectedOptionsView;
        constructor();
        onOptionValueChanged(listener: (item: AccessControlEntry) => void): void;
        unItemValueChanged(listener: (item: AccessControlEntry) => void): void;
    }
}
declare module api.ui.security.acl {
    import UserStoreAccess = api.security.acl.UserStoreAccess;
    class UserStoreAccessSelector extends api.ui.tab.TabMenu {
        private static OPTIONS;
        private value;
        private valueChangedListeners;
        constructor();
        getValue(): UserStoreAccess;
        setValue(value: UserStoreAccess, silent?: boolean): UserStoreAccessSelector;
        private findOptionByValue(value);
        onValueChanged(listener: (event: api.ValueChangedEvent) => void): void;
        unValueChanged(listener: (event: api.ValueChangedEvent) => void): void;
        private notifyValueChanged(event);
    }
}
declare module api.ui.security.acl {
    import Principal = api.security.Principal;
    import UserStoreAccessControlEntry = api.security.acl.UserStoreAccessControlEntry;
    class UserStoreAccessControlEntryView extends api.ui.security.PrincipalViewer {
        private ace;
        private accessSelector;
        private removeButton;
        private valueChangedListeners;
        private editable;
        static debug: boolean;
        constructor(ace: UserStoreAccessControlEntry);
        getValueChangedListeners(): {
            (item: UserStoreAccessControlEntry): void;
        }[];
        setEditable(editable: boolean): void;
        isEditable(): boolean;
        onValueChanged(listener: (item: UserStoreAccessControlEntry) => void): void;
        unValueChanged(listener: (item: UserStoreAccessControlEntry) => void): void;
        notifyValueChanged(item: UserStoreAccessControlEntry): void;
        setUserStoreAccessControlEntry(ace: UserStoreAccessControlEntry, silent?: boolean): void;
        getUserStoreAccessControlEntry(): UserStoreAccessControlEntry;
        doLayout(object: Principal): void;
    }
}
declare module api.ui.security.acl {
    import UserStoreAccessControlEntry = api.security.acl.UserStoreAccessControlEntry;
    class UserStoreAccessControlListView extends api.ui.selector.list.ListBox<UserStoreAccessControlEntry> {
        private itemValueChangedListeners;
        private itemsEditable;
        constructor(className?: string);
        createItemView(entry: UserStoreAccessControlEntry, readOnly: boolean): UserStoreAccessControlEntryView;
        getItemId(item: UserStoreAccessControlEntry): string;
        onItemValueChanged(listener: (item: UserStoreAccessControlEntry) => void): void;
        unItemValueChanged(listener: (item: UserStoreAccessControlEntry) => void): void;
        notifyItemValueChanged(item: UserStoreAccessControlEntry): void;
        setItemsEditable(editable: boolean): UserStoreAccessControlListView;
        isItemsEditable(): boolean;
    }
}
declare module api.ui.security.acl {
    import UserStoreAccessControlEntry = api.security.acl.UserStoreAccessControlEntry;
    class UserStoreAccessControlEntryViewer extends api.ui.NamesAndIconViewer<UserStoreAccessControlEntry> {
        constructor();
        resolveDisplayName(object: UserStoreAccessControlEntry): string;
        resolveUnnamedDisplayName(object: UserStoreAccessControlEntry): string;
        resolveSubName(object: UserStoreAccessControlEntry, relativePath?: boolean): string;
        resolveIconClass(object: UserStoreAccessControlEntry): string;
    }
}
declare module api.ui.security.acl {
    import UserStoreAccessControlEntry = api.security.acl.UserStoreAccessControlEntry;
    class UserStoreAccessControlComboBox extends api.ui.selector.combobox.RichComboBox<UserStoreAccessControlEntry> {
        private aceSelectedOptionsView;
        constructor();
        onOptionValueChanged(listener: (item: UserStoreAccessControlEntry) => void): void;
        unItemValueChanged(listener: (item: UserStoreAccessControlEntry) => void): void;
    }
}
declare module api.ui.security.acl {
    import AccessControlEntry = api.security.acl.AccessControlEntry;
    class UserAccessListView extends api.ui.selector.list.ListBox<AccessControlEntry> {
        private userAccessListItemViews;
        constructor(className?: string);
        doRender(): wemQ.Promise<boolean>;
        setItemViews(userAccessListItemViews: UserAccessListItemView[]): void;
    }
}
declare module api.ui.security.acl {
    import User = api.security.User;
    class UserAccessListItemView extends api.ui.Viewer<EffectivePermission> {
        private userLine;
        private accessLine;
        private resizeListener;
        private currentUser;
        private static OPTIONS;
        static debug: boolean;
        constructor(className?: string);
        setCurrentUser(user: User): void;
        doLayout(object: EffectivePermission): void;
        remove(): any;
        private setExtraCount();
        private getVisibleCount();
        private getOptionName(access);
    }
}
declare module api.ui.security.acl {
    class EffectivePermission {
        private access;
        private permissionAccess;
        getAccess(): Access;
        getPermissionAccess(): EffectivePermissionAccess;
        getMembers(): EffectivePermissionMember[];
        static fromJson(json: api.content.json.EffectivePermissionJson): EffectivePermission;
    }
}
declare module api.ui.security.acl {
    class EffectivePermissionAccess {
        private count;
        private users;
        static fromJson(json: api.content.json.EffectivePermissionAccessJson): EffectivePermissionAccess;
        getCount(): number;
        getUsers(): EffectivePermissionMember[];
    }
}
declare module api.ui.security.acl {
    import PrincipalKey = api.security.PrincipalKey;
    import Principal = api.security.Principal;
    class EffectivePermissionMember {
        private userKey;
        private displayName;
        constructor(userKey: PrincipalKey, displayName: string);
        getUserKey(): PrincipalKey;
        getDisplayName(): string;
        toPrincipal(): Principal;
        static fromJson(json: api.content.json.EffectivePermissionMemberJson): EffectivePermissionMember;
    }
}
declare module api.ui.locale {
    import Locale = api.locale.Locale;
    class LocaleViewer extends api.ui.Viewer<Locale> {
        private namesView;
        private removeClickedListeners;
        private displayNamePattern;
        constructor();
        setObject(locale: Locale): void;
        getPreferredHeight(): number;
        onRemoveClicked(listener: (event: MouseEvent) => void): void;
        unRemoveClicked(listener: (event: MouseEvent) => void): void;
        notifyRemoveClicked(event: MouseEvent): void;
    }
}
declare module api.ui.locale {
    import Locale = api.locale.Locale;
    class LocaleComboBox extends api.ui.selector.combobox.RichComboBox<Locale> {
        constructor(maxOccurrences?: number, value?: string);
        clearSelection(forceClear?: boolean): void;
    }
}
/**
 * This module holds classes for defining a form [[Form]] and for displaying form [[FormView]].
 *
 * A form is defined by creating new [[Form]] and adding [[FormItem]]s to it.
 * A [[FormItem]] can either be a [[Input]], [[FormItemSet]] or a [[FieldSet]].
 */
declare module api.form {
}
declare module api.form.json {
    interface FormItemJson {
        name: string;
    }
}
declare module api.form.json {
    class OccurrencesJson {
        maximum: number;
        minimum: number;
    }
}
declare module api.form.json {
    interface LayoutJson extends FormItemJson {
        layoutType: string;
    }
}
declare module api.form.json {
    interface FieldSetJson extends LayoutJson {
        items: LayoutTypeWrapperJson[];
        label: string;
    }
}
declare module api.form.json {
    interface LayoutTypeWrapperJson {
        FieldSet?: FieldSetJson;
    }
}
declare module api.form.json {
    interface FormItemSetJson extends FormSetJson {
        customText?: string;
        immutable?: boolean;
        items: FormItemTypeWrapperJson[];
    }
}
declare module api.form.json {
    interface InputJson extends FormItemJson {
        customText?: string;
        helpText?: string;
        immutable?: boolean;
        indexed?: boolean;
        label: string;
        occurrences: OccurrencesJson;
        validationRegexp?: string;
        inputType: string;
        config?: any;
        maximizeUIInputWidth?: boolean;
        defaultValue?: {
            type: string;
            value: any;
        };
    }
}
declare module api.form.json {
    interface FormSetJson extends FormItemJson {
        helpText?: string;
        label: string;
        occurrences: OccurrencesJson;
    }
}
declare module api.form.json {
    interface FormOptionSetOptionJson {
        name: string;
        label: string;
        defaultOption?: boolean;
        helpText?: string;
        items?: FormItemTypeWrapperJson[];
    }
}
declare module api.form.json {
    interface FormOptionSetJson extends FormSetJson {
        expanded?: boolean;
        options: FormOptionSetOptionJson[];
        multiselection: OccurrencesJson;
    }
}
declare module api.form.json {
    interface FormItemTypeWrapperJson {
        Input?: InputJson;
        FormItemSet?: FormItemSetJson;
        FieldSet?: FieldSetJson;
        FormOptionSet?: FormOptionSetJson;
        FormOptionSetOption?: FormOptionSetOptionJson;
    }
}
declare module api.form.json {
    class FormJson {
        formItems: FormItemTypeWrapperJson[];
    }
}
declare module api.form {
    class FormItemPath {
        private static DEFAULT_ELEMENT_DIVIDER;
        static ROOT: FormItemPath;
        private elementDivider;
        private absolute;
        private elements;
        private refString;
        static fromString(s: string, elementDivider?: string): FormItemPath;
        static fromParent(parent: FormItemPath, ...childElements: FormItemPathElement[]): FormItemPath;
        private static removeEmptyElements(elements);
        constructor(elements: FormItemPathElement[], elementDivider?: string, absolute?: boolean);
        newWithoutFirstElement(): FormItemPath;
        elementCount(): number;
        getElements(): FormItemPathElement[];
        getElement(index: number): FormItemPathElement;
        getFirstElement(): FormItemPathElement;
        getLastElement(): FormItemPathElement;
        hasParent(): boolean;
        getParentPath(): FormItemPath;
        toString(): string;
        isAbsolute(): boolean;
    }
    class FormItemPathElement {
        private name;
        constructor(name: string);
        getName(): string;
        toString(): string;
        static fromString(str: string): FormItemPathElement;
    }
}
declare module api.form {
    class FormItem implements api.Equitable {
        private name;
        private parent;
        constructor(name: string);
        setParent(parent: FormItem): void;
        getName(): string;
        getPath(): FormItemPath;
        getParent(): FormItem;
        private resolvePath();
        private resolveParentPath();
        equals(o: api.Equitable): boolean;
        toFormItemJson(): api.form.json.FormItemTypeWrapperJson;
        static formItemsToJson(formItems: FormItem[]): api.form.json.FormItemTypeWrapperJson[];
    }
}
declare module api.form {
    interface FormItemContainer {
        getFormItems(): FormItem[];
    }
}
declare module api.form {
    class OccurrencesBuilder {
        minimum: number;
        maximum: number;
        setMinimum(value: number): OccurrencesBuilder;
        setMaximum(value: number): OccurrencesBuilder;
        fromJson(json: json.OccurrencesJson): void;
        build(): Occurrences;
    }
    class Occurrences implements api.Equitable {
        private minimum;
        private maximum;
        static fromJson(json: json.OccurrencesJson): Occurrences;
        constructor(builder: OccurrencesBuilder);
        getMaximum(): number;
        getMinimum(): number;
        required(): boolean;
        multiple(): boolean;
        minimumReached(occurrenceCount: number): boolean;
        minimumBreached(occurrenceCount: number): boolean;
        maximumReached(occurrenceCount: number): boolean;
        maximumBreached(occurrenceCount: number): boolean;
        toJson(): api.form.json.OccurrencesJson;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.form {
    class InputTypeName implements api.Equitable {
        private static CUSTOM_PREFIX;
        private custom;
        private name;
        private refString;
        static parseInputTypeName(str: string): InputTypeName;
        constructor(name: string, custom: boolean);
        getName(): string;
        isBuiltIn(): boolean;
        toString(): string;
        toJson(): string;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.form {
    class InputBuilder {
        name: string;
        inputType: InputTypeName;
        label: string;
        immutable: boolean;
        occurrences: Occurrences;
        indexed: boolean;
        customText: string;
        validationRegex: string;
        helpText: string;
        inputTypeConfig: any;
        maximizeUIInputWidth: boolean;
        defaultValue: api.data.Value;
        setName(value: string): InputBuilder;
        setInputType(value: InputTypeName): InputBuilder;
        setLabel(value: string): InputBuilder;
        setImmutable(value: boolean): InputBuilder;
        setOccurrences(value: Occurrences): InputBuilder;
        setIndexed(value: boolean): InputBuilder;
        setCustomText(value: string): InputBuilder;
        setValidationRegex(value: string): InputBuilder;
        setHelpText(value: string): InputBuilder;
        setInputTypeConfig(value: any): InputBuilder;
        setMaximizeUIInputWidth(value: boolean): InputBuilder;
        fromJson(json: json.InputJson): InputBuilder;
        build(): Input;
    }
    /**
     * An input is a [[FormItem]] which the user can give input to.
     *
     * An input must be of certain type which using a [[InputTypeName]].
     * All input types must be registered in [[api.form.inputtype.InputTypeManager]] to be used.
     *
     */
    class Input extends FormItem implements api.Equitable {
        private inputType;
        private label;
        private immutable;
        private occurrences;
        private indexed;
        private customText;
        private validationRegex;
        private helpText;
        private inputTypeConfig;
        private maximizeUIInputWidth;
        private defaultValue;
        constructor(builder: InputBuilder);
        static fromJson(json: api.form.json.InputJson): Input;
        getInputType(): InputTypeName;
        getLabel(): string;
        isImmutable(): boolean;
        getOccurrences(): Occurrences;
        isIndexed(): boolean;
        isMaximizeUIInputWidth(): boolean;
        getCustomText(): string;
        getValidationRegex(): string;
        getHelpText(): string;
        getInputTypeConfig(): any;
        getDefaultValue(): api.data.Value;
        equals(o: api.Equitable): boolean;
        toInputJson(): api.form.json.FormItemTypeWrapperJson;
    }
}
declare module api.form {
    class FormValidityChangedEvent {
        private recording;
        private atLeastOneInputValueBroken;
        constructor(recording?: ValidationRecording, atLeastOneInputValueBroken?: boolean);
        isValid(): boolean;
        getRecording(): ValidationRecording;
    }
}
declare module api.form {
    class FormBuilder {
        formItems: FormItem[];
        addFormItem(formItem: FormItem): FormBuilder;
        addFormItems(formItems: FormItem[]): FormBuilder;
        fromJson(json: json.FormJson): FormBuilder;
        build(): Form;
    }
    /**
     * A form consist of [[FormItem]]s.
     *
     * A [[FormItem]] can either be a [[Input]], [[FormItemSet]] or a [[FieldSet]]:
     * * A [[Input]] gives the user the possibility input one or more values.
     * * A [[FormItemSet]] groups a set of [[FormItem]]s, both visually and the data.
     * * A [[FieldSet]] is a [[Layout]] which only visually groups [[FormItem]]s.
     */
    class Form implements api.Equitable, FormItemContainer {
        private formItems;
        private formItemByName;
        static fromJson(json: json.FormJson): Form;
        constructor(builder: FormBuilder);
        addFormItem(formItem: FormItem): void;
        getFormItems(): FormItem[];
        getFormItemByName(name: string): FormItem;
        getInputByName(name: string): Input;
        toJson(): api.form.json.FormJson;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.form {
    class FormItemFactory {
        static createForm(formJson: api.form.json.FormJson): Form;
        static createFormItem(formItemTypeWrapperJson: api.form.json.FormItemTypeWrapperJson): FormItem;
        static createInput(inputJson: api.form.json.InputJson): Input;
        static createFormItemSet(formItemSetJson: api.form.json.FormItemSetJson): api.form.FormItemSet;
        static createFieldSetLayout(fieldSetJson: api.form.json.FieldSetJson): FieldSet;
        static createFormOptionSet(optionSetJson: api.form.json.FormOptionSetJson): api.form.FormOptionSet;
        static createFormOptionSetOption(optionSetOptionJson: api.form.json.FormOptionSetOptionJson): api.form.FormOptionSetOption;
    }
}
declare module api.form {
    import PropertyPath = api.data.PropertyPath;
    class ValidationRecordingPath implements api.Equitable {
        private parentDataSet;
        private dataName;
        private refString;
        private min;
        private max;
        constructor(parentPropertySet: PropertyPath, dataName: string, min?: number, max?: number);
        private resolveRefString();
        getParentDataSet(): PropertyPath;
        getDataName(): string;
        getMin(): number;
        getMax(): number;
        toString(): string;
        equals(o: api.Equitable): boolean;
        contains(other: ValidationRecordingPath): boolean;
    }
}
declare module api.form {
    class RecordingValidityChangedEvent {
        private origin;
        private recording;
        private inputValueBroken;
        private includeChildren;
        constructor(recording: api.form.ValidationRecording, origin: api.form.ValidationRecordingPath);
        getOrigin(): api.form.ValidationRecordingPath;
        isValid(): boolean;
        getRecording(): api.form.ValidationRecording;
        setInputValueBroken(broken: boolean): RecordingValidityChangedEvent;
        isInputValueBroken(): boolean;
        setIncludeChildren(include: boolean): RecordingValidityChangedEvent;
        isIncludeChildren(): boolean;
    }
}
declare module api.form {
    class ValidationRecording {
        breaksMinimumOccurrencesArray: ValidationRecordingPath[];
        breaksMaximumOccurrencesArray: ValidationRecordingPath[];
        breaksMinimumOccurrences(path: ValidationRecordingPath): void;
        breaksMaximumOccurrences(path: ValidationRecordingPath): void;
        isValid(): boolean;
        isMinimumOccurrencesValid(): boolean;
        isMaximumOccurrencesValid(): boolean;
        flatten(recording: ValidationRecording): void;
        subtract(recording: ValidationRecording): void;
        /**
         * @param path - path to remove
         * @param strict - whether to match only exact matching paths
         * @param includeChildren - param saying if nested children should be removed as well
         */
        removeByPath(path: ValidationRecordingPath, strict?: boolean, includeChildren?: boolean): void;
        removeUnreachedMinimumOccurrencesByPath(path: ValidationRecordingPath, strict?: boolean, includeChildren?: boolean): void;
        removeBreachedMaximumOccurrencesByPath(path: ValidationRecordingPath, strict?: boolean, includeChildren?: boolean): void;
        equals(other: ValidationRecording): boolean;
        validityChanged(previous: api.form.ValidationRecording): boolean;
        containsPathInBreaksMin(path: ValidationRecordingPath): boolean;
        containsPathInBreaksMax(path: ValidationRecordingPath): boolean;
        private exists(path, array);
    }
}
declare module api.form {
    import PropertyPath = api.data.PropertyPath;
    class FormContext {
        private showEmptyFormItemSetOccurrences;
        constructor(builder: FormContextBuilder);
        getShowEmptyFormItemSetOccurrences(): boolean;
        setShowEmptyFormItemSetOccurrences(value: boolean): void;
        static create(): FormContextBuilder;
        createInputTypeViewContext(inputTypeConfig: any, parentPropertyPath: PropertyPath, input: Input): api.form.inputtype.InputTypeViewContext;
    }
    class FormContextBuilder {
        showEmptyFormItemSetOccurrences: boolean;
        setShowEmptyFormItemSetOccurrences(value: boolean): FormContextBuilder;
        build(): FormContext;
    }
}
declare module api.form {
    import PropertyArray = api.data.PropertyArray;
    class FormItemOccurrenceView extends api.dom.DivEl {
        protected formItemOccurrence: FormItemOccurrence<FormItemOccurrenceView>;
        private removeButtonClickedListeners;
        protected helpText: HelpTextContainer;
        constructor(className: string, formItemOccurrence: FormItemOccurrence<FormItemOccurrenceView>);
        toggleHelpText(show?: boolean): void;
        getDataPath(): api.data.PropertyPath;
        layout(validate?: boolean): wemQ.Promise<void>;
        update(propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;
        hasValidUserInput(): boolean;
        onRemoveButtonClicked(listener: (event: RemoveButtonClickedEvent<FormItemOccurrenceView>) => void): void;
        unRemoveButtonClicked(listener: (event: RemoveButtonClickedEvent<FormItemOccurrenceView>) => void): void;
        notifyRemoveButtonClicked(): void;
        getIndex(): number;
        refresh(): void;
        giveFocus(): boolean;
    }
}
declare module api.form {
    import PropertyArray = api.data.PropertyArray;
    interface FormItemOccurrencesConfig {
        formItem: FormItem;
        propertyArray: PropertyArray;
        occurrenceViewContainer: api.dom.Element;
        allowedOccurrences?: Occurrences;
    }
    class FormItemOccurrences<V extends FormItemOccurrenceView> {
        private occurrences;
        private occurrenceViews;
        private occurrenceViewContainer;
        private formItem;
        protected propertyArray: PropertyArray;
        private allowedOccurrences;
        private occurrenceAddedListeners;
        private occurrenceRenderedListeners;
        private occurrenceRemovedListeners;
        private focusListeners;
        private blurListeners;
        private focusListener;
        private blurListener;
        static debug: boolean;
        constructor(config: FormItemOccurrencesConfig);
        protected constructOccurrencesForNoData(): FormItemOccurrence<V>[];
        protected constructOccurrencesForData(): FormItemOccurrence<V>[];
        getAllowedOccurrences(): Occurrences;
        onOccurrenceRendered(listener: (event: OccurrenceRenderedEvent) => void): void;
        unOccurrenceRendered(listener: (event: OccurrenceRenderedEvent) => void): void;
        private notifyOccurrenceRendered(occurrence, occurrenceView, validate);
        onOccurrenceAdded(listener: (event: OccurrenceAddedEvent) => void): void;
        unOccurrenceAdded(listener: (event: OccurrenceAddedEvent) => void): void;
        private notifyOccurrenceAdded(occurrence, occurrenceView);
        onOccurrenceRemoved(listener: (event: OccurrenceRemovedEvent) => void): void;
        unOccurrenceRemoved(listener: (event: OccurrenceRemovedEvent) => void): void;
        private notifyOccurrenceRemoved(occurrence, occurrenceView);
        getFormItem(): FormItem;
        maximumOccurrencesReached(): boolean;
        layout(validate?: boolean): wemQ.Promise<void>;
        update(propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        createNewOccurrenceView(occurrence: FormItemOccurrence<V>): V;
        updateOccurrenceView(occurrenceView: V, propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;
        resetOccurrenceView(occurrenceView: V): void;
        createNewOccurrence(formItemOccurrences: FormItemOccurrences<V>, insertAtIndex: number): FormItemOccurrence<V>;
        createAndAddOccurrence(insertAtIndex?: number, validate?: boolean): wemQ.Promise<V>;
        protected addOccurrence(occurrence: FormItemOccurrence<V>, validate?: boolean): wemQ.Promise<V>;
        protected removeOccurrenceView(occurrenceViewToRemove: V): void;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        private notifyFocused(event);
        private notifyBlurred(event);
        resetOccurrenceIndexes(): void;
        refreshOccurrenceViews(): void;
        getOccurrenceViewElementBefore(index: number): V;
        countOccurrences(): number;
        moveOccurrence(fromIndex: number, toIndex: number): void;
        getOccurrences(): FormItemOccurrence<V>[];
        canRemove(): boolean;
        getOccurrenceViews(): V[];
    }
}
declare module api.form {
    class FormItemOccurrence<V extends FormItemOccurrenceView> {
        private occurrences;
        private formItem;
        private allowedOccurrences;
        private index;
        constructor(occurrences: FormItemOccurrences<V>, index: number, allowedOccurrences: Occurrences);
        setIndex(value: number): void;
        getIndex(): number;
        isRemoveButtonRequired(): boolean;
        isRemoveButtonRequiredStrict(): boolean;
        showAddButton(): boolean;
        isMultiple(): boolean;
        oneAndOnly(): boolean;
        private moreThanRequiredOccurrences();
        private lessOccurrencesThanMaximumAllowed();
        private isLastOccurrence();
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    interface FormItemViewConfig {
        className: string;
        context: FormContext;
        formItem: FormItem;
        parent: FormItemOccurrenceView;
    }
    class FormItemView extends api.dom.DivEl {
        private context;
        private formItem;
        private parent;
        private editContentRequestListeners;
        private highlightOnValidityChanged;
        constructor(config: FormItemViewConfig);
        setHighlightOnValidityChange(highlight: boolean): void;
        broadcastFormSizeChanged(): void;
        layout(): wemQ.Promise<void>;
        update(propertyArray: PropertySet, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        getContext(): FormContext;
        getFormItem(): FormItem;
        getParent(): FormItemOccurrenceView;
        displayValidationErrors(value: boolean): void;
        hasValidUserInput(): boolean;
        validate(silent?: boolean): ValidationRecording;
        giveFocus(): boolean;
        highlightOnValidityChange(): boolean;
        onEditContentRequest(listener: (content: api.content.ContentSummary) => void): void;
        unEditContentRequest(listener: (content: api.content.ContentSummary) => void): void;
        notifyEditContentRequested(content: api.content.ContentSummary): void;
        onValidityChanged(listener: (event: RecordingValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: RecordingValidityChangedEvent) => void): void;
        toggleHelpText(show?: boolean): void;
        hasHelpText(): boolean;
    }
}
declare module api.form {
    class FormOccurrenceDraggableLabel extends api.dom.DivEl {
        constructor(label: string, occurrences: Occurrences, note?: string);
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    import PropertyArray = api.data.PropertyArray;
    class FormSetView<V extends FormSetOccurrenceView> extends FormItemView {
        protected parentDataSet: PropertySet;
        protected occurrenceViewsContainer: api.dom.DivEl;
        protected bottomButtonRow: api.dom.DivEl;
        protected addButton: api.ui.button.Button;
        protected collapseButton: api.dom.AEl;
        protected validityChangedListeners: {
            (event: RecordingValidityChangedEvent): void;
        }[];
        protected previousValidationRecording: ValidationRecording;
        protected formItemOccurrences: FormSetOccurrences<V>;
        protected classPrefix: string;
        protected helpText: string;
        protected formSet: FormSet;
        /**
         * The index of child Data being dragged.
         */
        protected draggingIndex: number;
        constructor(config: FormItemViewConfig);
        layout(validate?: boolean): wemQ.Promise<void>;
        private subscribeFormSetOccurrencesOnEvents();
        private makeAddButton();
        private makeCollapseButton();
        protected handleFormSetOccurrenceViewValidityChanged(event: RecordingValidityChangedEvent): void;
        protected getPropertyArray(propertySet: PropertySet): PropertyArray;
        protected initOccurrences(): FormSetOccurrences<V>;
        validate(silent?: boolean, viewToSkipValidation?: FormItemOccurrenceView): ValidationRecording;
        broadcastFormSizeChanged(): void;
        refresh(): void;
        update(propertySet: api.data.PropertySet, unchangedOnly?: boolean): Q.Promise<void>;
        displayValidationErrors(value: boolean): void;
        setHighlightOnValidityChange(highlight: boolean): void;
        hasValidUserInput(): boolean;
        onValidityChanged(listener: (event: RecordingValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: RecordingValidityChangedEvent) => void): void;
        protected notifyValidityChanged(event: RecordingValidityChangedEvent): void;
        protected renderValidationErrors(recording: ValidationRecording): void;
        protected handleDnDStart(event: Event, ui: JQueryUI.SortableUIParams): void;
        protected handleDnDUpdate(event: Event, ui: JQueryUI.SortableUIParams): void;
        toggleHelpText(show?: boolean): void;
        hasHelpText(): boolean;
        protected getOccurrences(): api.form.Occurrences;
        protected resolveValidationRecordingPath(): ValidationRecordingPath;
        giveFocus(): boolean;
        reset(): void;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.form {
    class FormSetOccurrence<V extends FormSetOccurrenceView> extends FormItemOccurrence<V> {
        constructor(formSetOccurrences: FormSetOccurrences<V>, index: number);
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    import PropertyArray = api.data.PropertyArray;
    class FormSetOccurrenceView extends FormItemOccurrenceView {
        protected formItemViews: FormItemView[];
        protected validityChangedListeners: {
            (event: RecordingValidityChangedEvent): void;
        }[];
        protected removeButton: api.dom.AEl;
        protected label: FormOccurrenceDraggableLabel;
        protected currentValidationState: ValidationRecording;
        protected formItemLayer: FormItemLayer;
        protected propertySet: PropertySet;
        protected formSetOccurrencesContainer: api.dom.DivEl;
        protected occurrenceContainerClassName: string;
        constructor(className: string, formItemOccurrence: FormItemOccurrence<FormItemOccurrenceView>);
        layout(validate?: boolean): wemQ.Promise<void>;
        protected initValidationMessageBlock(): void;
        getDataPath(): api.data.PropertyPath;
        validate(silent?: boolean): ValidationRecording;
        protected extraValidation(validationRecording: ValidationRecording): void;
        protected subscribeOnItemEvents(): void;
        protected getFormSet(): FormSet;
        protected getFormItems(): FormItem[];
        toggleHelpText(show?: boolean): any;
        update(propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;
        hasValidUserInput(): boolean;
        protected ensureSelectionArrayExists(propertyArraySet: PropertySet): void;
        showContainer(show: boolean): void;
        refresh(): void;
        reset(): void;
        protected resolveValidationRecordingPath(): ValidationRecordingPath;
        getValidationRecording(): ValidationRecording;
        getFormItemViews(): FormItemView[];
        giveFocus(): boolean;
        onEditContentRequest(listener: (content: api.content.ContentSummary) => void): void;
        unEditContentRequest(listener: (content: api.content.ContentSummary) => void): void;
        displayValidationErrors(value: boolean): void;
        setHighlightOnValidityChange(highlight: boolean): void;
        onValidityChanged(listener: (event: RecordingValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: RecordingValidityChangedEvent) => void): void;
        protected notifyValidityChanged(event: RecordingValidityChangedEvent): void;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    import PropertyArray = api.data.PropertyArray;
    class FormSetOccurrences<V extends FormSetOccurrenceView> extends FormItemOccurrences<V> {
        protected context: FormContext;
        protected parent: FormSetOccurrenceView;
        protected occurrencesCollapsed: boolean;
        protected formSet: FormSet;
        constructor(config: FormItemOccurrencesConfig);
        showOccurrences(show: boolean): void;
        getFormSet(): FormSet;
        getAllowedOccurrences(): Occurrences;
        createNewOccurrence(formItemOccurrences: FormItemOccurrences<V>, insertAtIndex: number): FormItemOccurrence<V>;
        protected getSetFromArray(occurrence: FormItemOccurrence<V>): PropertySet;
        protected constructOccurrencesForNoData(): FormItemOccurrence<V>[];
        protected constructOccurrencesForData(): FormItemOccurrence<V>[];
        toggleHelpText(show?: boolean): void;
        isCollapsed(): boolean;
        moveOccurrence(index: number, destinationIndex: number): void;
        updateOccurrenceView(occurrenceView: FormSetOccurrenceView, propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;
        resetOccurrenceView(occurrenceView: FormSetOccurrenceView): void;
    }
}
declare module api.form {
    /**
     * A parent for [[FormItemSet]] and [[FormOptionSet]].
     */
    class FormSet extends FormItem {
        private label;
        private occurrences;
        private helpText;
        private helpTextIsOn;
        constructor(formSetJson: api.form.json.FormSetJson);
        getLabel(): string;
        getHelpText(): string;
        getOccurrences(): Occurrences;
        isHelpTextOn(): boolean;
        toggleHelpText(show?: boolean): void;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.form {
    /**
     * A set of [[FormItem]]s.
     *
     * The form items are kept in the order they where inserted.
     */
    class FormItemSet extends FormSet implements FormItemContainer {
        private formItems;
        private formItemByName;
        private immutable;
        private customText;
        constructor(formItemSetJson: api.form.json.FormItemSetJson);
        addFormItem(formItem: FormItem): void;
        getFormItems(): FormItem[];
        getFormItemByName(name: string): FormItem;
        getInputByName(name: string): Input;
        isImmutable(): boolean;
        getCustomText(): string;
        toFormItemSetJson(): api.form.json.FormItemTypeWrapperJson;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.form {
    import PropertyArray = api.data.PropertyArray;
    interface FormItemSetOccurrencesConfig {
        context: FormContext;
        occurrenceViewContainer: api.dom.Element;
        formItemSet: FormItemSet;
        parent: FormItemSetOccurrenceView;
        propertyArray: PropertyArray;
    }
    class FormItemSetOccurrences extends FormSetOccurrences<FormItemSetOccurrenceView> {
        constructor(config: FormItemSetOccurrencesConfig);
        createNewOccurrenceView(occurrence: FormSetOccurrence<FormItemSetOccurrenceView>): FormItemSetOccurrenceView;
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    interface FormItemSetOccurrenceViewConfig {
        context: FormContext;
        formSetOccurrence: FormSetOccurrence<FormItemSetOccurrenceView>;
        formItemSet: FormItemSet;
        parent: FormItemSetOccurrenceView;
        dataSet: PropertySet;
    }
    class FormItemSetOccurrenceView extends FormSetOccurrenceView {
        private formItemSet;
        constructor(config: FormItemSetOccurrenceViewConfig);
        protected subscribeOnItemEvents(): void;
        validate(silent?: boolean): ValidationRecording;
        protected getFormSet(): FormSet;
        protected getFormItems(): FormItem[];
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    interface FormItemSetViewConfig {
        context: FormContext;
        formItemSet: FormItemSet;
        parent: FormItemSetOccurrenceView;
        parentDataSet: PropertySet;
    }
    class FormItemSetView extends FormSetView<FormItemSetOccurrenceView> {
        constructor(config: FormItemSetViewConfig);
        protected initOccurrences(): FormSetOccurrences<FormItemSetOccurrenceView>;
    }
}
declare module api.form {
    import FormOptionSetOptionJson = api.form.json.FormOptionSetOptionJson;
    class FormOptionSetOption extends FormItem implements FormItemContainer, api.Equitable {
        private label;
        private defaultOption;
        private formItems;
        private helpText;
        private helpTextIsOn;
        private formItemByName;
        constructor(optionJson: FormOptionSetOptionJson);
        addFormItem(formItem: FormItem): void;
        getFormItems(): api.form.FormItem[];
        static fromJson(optionJson: FormOptionSetOptionJson): FormOptionSetOption;
        getLabel(): string;
        isDefaultOption(): boolean;
        getHelpText(): string;
        isHelpTextOn(): boolean;
        toFormOptionSetOptionJson(): api.form.json.FormOptionSetOptionJson;
        static optionsToJson(options: FormOptionSetOption[]): api.form.json.FormOptionSetOptionJson[];
        equals(o: api.Equitable): boolean;
    }
}
declare module api.form {
    class FormOptionSet extends FormSet implements FormItemContainer {
        private options;
        private expanded;
        private multiselection;
        constructor(formOptionSetJson: api.form.json.FormOptionSetJson);
        addSetOption(option: FormOptionSetOption): void;
        getFormItems(): FormItem[];
        getOptions(): FormOptionSetOption[];
        isExpanded(): boolean;
        getMultiselection(): Occurrences;
        isRadioSelection(): boolean;
        toFormOptionSetJson(): api.form.json.FormItemTypeWrapperJson;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.form {
    import PropertyArray = api.data.PropertyArray;
    interface FormOptionSetOccurrencesConfig {
        context: FormContext;
        occurrenceViewContainer: api.dom.Element;
        formOptionSet: FormOptionSet;
        parent: FormOptionSetOccurrenceView;
        propertyArray: PropertyArray;
    }
    class FormOptionSetOccurrences extends FormSetOccurrences<FormOptionSetOccurrenceView> {
        constructor(config: FormOptionSetOccurrencesConfig);
        createNewOccurrenceView(occurrence: FormSetOccurrence<FormOptionSetOccurrenceView>): FormOptionSetOccurrenceView;
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    interface FormOptionSetOccurrenceViewConfig {
        context: FormContext;
        formSetOccurrence: FormSetOccurrence<FormOptionSetOccurrenceView>;
        formOptionSet: FormOptionSet;
        parent: FormItemOccurrenceView;
        dataSet: PropertySet;
    }
    class FormOptionSetOccurrenceView extends FormSetOccurrenceView {
        private formOptionSet;
        private context;
        private selectionValidationMessage;
        constructor(config: FormOptionSetOccurrenceViewConfig);
        protected initValidationMessageBlock(): void;
        protected subscribeOnItemEvents(): void;
        private renderSelectionValidationMessage(selectionValidationRecording);
        private makeMultiselectionNote();
        protected ensureSelectionArrayExists(propertyArraySet: PropertySet): void;
        private addDefaultSelectionToSelectionArray(selectionPropertyArray);
        protected extraValidation(validationRecording: ValidationRecording): void;
        private validateMultiselection();
        protected getFormSet(): FormSet;
        protected getFormItems(): FormItem[];
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    interface FormOptionSetOptionViewConfig {
        context: FormContext;
        formOptionSetOption: FormOptionSetOption;
        parent: FormOptionSetOccurrenceView;
        parentDataSet: PropertySet;
    }
    class FormOptionSetOptionView extends FormItemView {
        private formOptionSetOption;
        private parentDataSet;
        private optionItemsContainer;
        private formItemViews;
        private formItemLayer;
        private selectionChangedListeners;
        private checkbox;
        private requiresClean;
        private isOptionSetExpandedByDefault;
        protected helpText: HelpTextContainer;
        private checkboxEnabledStatusHandler;
        private radioDeselectHandler;
        private subscribedOnDeselect;
        constructor(config: FormOptionSetOptionViewConfig);
        toggleHelpText(show?: boolean): void;
        layout(validate?: boolean): wemQ.Promise<void>;
        private getOptionItemsPropertyArray(propertySet);
        private getSelectedOptionsArray();
        private getThisPropertyFromSelectedOptionsArray();
        getName(): string;
        private makeSelectionButton();
        private makeSelectionRadioButton();
        private topEdgeIsVisible(el);
        private calcDistToTopOfScrollableArea(el);
        private getToolbarOffsetTop(delta?);
        private subscribeOnRadioDeselect(property);
        private makeSelectionCheckbox();
        private subscribeCheckboxOnPropertyEvents();
        private setCheckBoxDisabled(checked?);
        private selectHandle(input);
        private deselectHandle();
        private removeNonDefaultOptionFromSelectionArray();
        private isChildOfDeselectedParent();
        private cleanValidationForThisOption();
        private cleanSelectionMessageForThisOption();
        private expand(condition?);
        private enableFormItems();
        private disableFormItems();
        private resetAllFormItems();
        private removeNonDataProperties(property);
        private isSelectionLimitReached();
        private isRadioSelection();
        private getMultiselection();
        reset(): void;
        update(propertySet: api.data.PropertySet, unchangedOnly?: boolean): Q.Promise<void>;
        private updateViewState();
        broadcastFormSizeChanged(): void;
        displayValidationErrors(value: boolean): void;
        setHighlightOnValidityChange(highlight: boolean): void;
        hasValidUserInput(): boolean;
        validate(silent?: boolean): ValidationRecording;
        onValidityChanged(listener: (event: RecordingValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: RecordingValidityChangedEvent) => void): void;
        onSelectionChanged(listener: () => void): void;
        unSelectionChanged(listener: () => void): void;
        private notifySelectionChanged();
        giveFocus(): boolean;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    interface FormOptionSetViewConfig {
        context: FormContext;
        formOptionSet: FormOptionSet;
        parent: FormOptionSetOccurrenceView;
        parentDataSet: PropertySet;
    }
    class FormOptionSetView extends FormSetView<FormOptionSetOccurrenceView> {
        constructor(config: FormOptionSetViewConfig);
        protected initOccurrences(): FormSetOccurrences<FormOptionSetOccurrenceView>;
    }
}
declare module api.form {
    class FieldSet extends FormItem implements FormItemContainer {
        private label;
        private formItems;
        constructor(fieldSetJson: api.form.json.FieldSetJson);
        addFormItem(formItem: FormItem): void;
        getLabel(): string;
        getFormItems(): FormItem[];
        toFieldSetJson(): api.form.json.FormItemTypeWrapperJson;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.form {
    class FieldSetLabel extends api.dom.DivEl {
        private fieldSet;
        constructor(fieldSet: FieldSet);
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    interface FieldSetViewConfig {
        context: FormContext;
        fieldSet: FieldSet;
        parent: FormItemOccurrenceView;
        dataSet?: PropertySet;
    }
    class FieldSetView extends FormItemView {
        private fieldSet;
        private propertySet;
        private formItemViews;
        private formItemLayer;
        constructor(config: FieldSetViewConfig);
        broadcastFormSizeChanged(): void;
        layout(): wemQ.Promise<void>;
        getFormItemViews(): FormItemView[];
        private doLayout();
        update(propertySet: PropertySet, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        onEditContentRequest(listener: (content: api.content.ContentSummary) => void): void;
        unEditContentRequest(listener: (content: api.content.ContentSummary) => void): void;
        giveFocus(): boolean;
        displayValidationErrors(value: boolean): void;
        setHighlightOnValidityChange(highlight: boolean): void;
        hasValidUserInput(): boolean;
        validate(silent?: boolean): ValidationRecording;
        onValidityChanged(listener: (event: RecordingValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: RecordingValidityChangedEvent) => void): void;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    class FormItemLayer {
        private context;
        private formItems;
        private parentEl;
        private formItemViews;
        private parent;
        static debug: boolean;
        constructor(context: FormContext);
        setFormItems(formItems: FormItem[]): FormItemLayer;
        setParentElement(parentEl: api.dom.Element): FormItemLayer;
        setParent(value: FormItemOccurrenceView): FormItemLayer;
        layout(propertySet: PropertySet, validate?: boolean): wemQ.Promise<FormItemView[]>;
        private doLayoutPropertySet(propertySet, validate?);
        update(propertySet: PropertySet, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        toggleHelpText(show?: boolean): void;
        hasHelpText(): boolean;
    }
}
declare module api.form {
    class InputLabel extends api.dom.DivEl {
        private input;
        constructor(input: Input);
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    interface InputViewConfig {
        context: FormContext;
        input: Input;
        parent: FormItemOccurrenceView;
        parentDataSet: PropertySet;
    }
    class InputView extends api.form.FormItemView {
        private input;
        private parentPropertySet;
        private propertyArray;
        private inputTypeView;
        private bottomButtonRow;
        private addButton;
        private validationViewer;
        private previousValidityRecording;
        private userInputValid;
        private validityChangedListeners;
        private helpText;
        static debug: boolean;
        constructor(config: InputViewConfig);
        layout(validate?: boolean): wemQ.Promise<void>;
        private getPropertyArray(propertySet);
        update(propertySet: PropertySet, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        getInputTypeView(): api.form.inputtype.InputTypeView<any>;
        private createInputTypeView();
        broadcastFormSizeChanged(): void;
        refresh(validate?: boolean): void;
        private resolveValidationRecordingPath();
        displayValidationErrors(value: boolean): void;
        hasValidUserInput(): boolean;
        validate(silent?: boolean): ValidationRecording;
        private handleInputValidationRecording(inputRecording, silent?);
        userInputValidityChanged(currentState: boolean): boolean;
        giveFocus(): boolean;
        onValidityChanged(listener: (event: RecordingValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: RecordingValidityChangedEvent) => void): void;
        private notifyValidityChanged(event);
        private renderValidationErrors(recording, additionalValidationRecord);
        private mayRenderValidationError();
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        toggleHelpText(show?: boolean): void;
        hasHelpText(): boolean;
    }
}
declare module api.form {
    import PropertySet = api.data.PropertySet;
    /**
     * Creates a UI component representing the given [[Form]] backed by given [[api.data.PropertySet]].
     * Form data is both read from and written to the given [[api.data.PropertySet]] as the user changes the form.
     *
     * When displaying a form for a empty PropertyTree, then FormItemSet's will not be displayed by default.
     * To enable displaying set [[FormContext.showEmptyFormItemSetOccurrences]] to true.
     */
    class FormView extends api.dom.DivEl {
        private context;
        private form;
        private data;
        private formItemViews;
        private formItemLayer;
        private formValidityChangedListeners;
        private previousValidationRecording;
        private width;
        private focusListeners;
        private blurListeners;
        private layoutFinishedListeners;
        static debug: boolean;
        static VALIDATION_CLASS: string;
        /**
         * @param context the form context.
         * @param form the form to display.
         * @param data the data to back the form with.
         */
        constructor(context: FormContext, form: Form, data: PropertySet);
        /**
         * Lays out the form.
         */
        layout(): wemQ.Promise<void>;
        update(propertySet: PropertySet, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        highlightInputsOnValidityChange(highlight: boolean): void;
        private checkSizeChanges();
        private preserveCurrentSize();
        private isSizeChanged();
        private broadcastFormSizeChanged();
        hasValidUserInput(): boolean;
        validate(silent?: boolean, forceNotify?: boolean): ValidationRecording;
        isValid(): boolean;
        displayValidationErrors(value: boolean): void;
        getData(): PropertySet;
        giveFocus(): boolean;
        onValidityChanged(listener: (event: FormValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: FormValidityChangedEvent) => void): void;
        private notifyValidityChanged(event);
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        onLayoutFinished(listener: () => void): void;
        unLayoutFinished(listener: () => void): void;
        private notifyFocused(event);
        private notifyBlurred(event);
        private notifyLayoutFinished();
        toggleHelpText(show?: boolean): void;
        hasHelpText(): boolean;
    }
}
declare module api.form {
    class HelpTextContainer {
        private helpTextDiv;
        private helpTextToggler;
        private toggleListeners;
        constructor(value: string);
        toggleHelpText(show?: boolean): void;
        getToggler(): api.dom.DivEl;
        getHelpText(): api.dom.DivEl;
        onHelpTextToggled(listener: (show: boolean) => void): void;
        unHelpTextToggled(listener: (show: boolean) => void): void;
        private notifyHelpTextToggled(show);
    }
}
declare module api.form {
    class RemoveButtonClickedEvent<V> {
        private view;
        constructor(view: V);
        getView(): V;
    }
}
declare module api.form {
    class OccurrenceRemovedEvent {
        private occurrence;
        private occurrenceView;
        constructor(occurrence: FormItemOccurrence<FormItemOccurrenceView>, occurrenceView: FormItemOccurrenceView);
        getOccurrence(): FormItemOccurrence<FormItemOccurrenceView>;
        getOccurrenceView(): FormItemOccurrenceView;
    }
}
declare module api.form {
    class OccurrenceAddedEvent {
        private occurrence;
        private occurrenceView;
        constructor(occurrence: FormItemOccurrence<FormItemOccurrenceView>, occurrenceView: FormItemOccurrenceView);
        getOccurrence(): FormItemOccurrence<FormItemOccurrenceView>;
        getOccurrenceView(): FormItemOccurrenceView;
    }
}
declare module api.form {
    class OccurrenceRenderedEvent {
        private occurrence;
        private occurrenceView;
        private validateOnRender;
        constructor(occurrence: FormItemOccurrence<FormItemOccurrenceView>, occurrenceView: FormItemOccurrenceView, validateViewOnRender?: boolean);
        getOccurrence(): FormItemOccurrence<FormItemOccurrenceView>;
        getOccurrenceView(): FormItemOccurrenceView;
        validateViewOnRender(): boolean;
    }
}
declare module api.form {
    class ValidationRecordingViewer extends api.ui.Viewer<ValidationRecording> {
        private list;
        private minText;
        private minTextSingle;
        private maxText;
        constructor();
        doLayout(object: ValidationRecording): void;
        appendValidationMessage(message: string, removeExisting?: boolean): void;
        setError(text: string): void;
        private createItemView(path, breaksMin);
        private resolveMinText(path);
        private resolveMaxText(path);
    }
}
declare module api.form {
    class AdditionalValidationRecord {
        private message;
        private overwriteDefault;
        constructor(builder: Builder);
        static create(): Builder;
        getMessage(): string;
        isOverwriteDefault(): boolean;
        equals(that: AdditionalValidationRecord): boolean;
    }
    class Builder {
        message: string;
        overwriteDefault: boolean;
        setMessage(value: string): Builder;
        setOverwriteDefault(value: boolean): Builder;
        build(): AdditionalValidationRecord;
    }
}
declare module api.form.inputtype {
    interface InputTypeViewContext {
        formContext: api.form.FormContext;
        input: api.form.Input;
        inputConfig: {
            [element: string]: {
                [name: string]: string;
            }[];
        };
        parentDataPath: api.data.PropertyPath;
    }
}
declare module api.form.inputtype {
    import Value = api.data.Value;
    class ValueAddedEvent {
        private value;
        constructor(value: Value);
        getValue(): Value;
    }
}
declare module api.form.inputtype {
    import Value = api.data.Value;
    class ValueChangedEvent {
        private newValue;
        private arrayIndex;
        constructor(newValue: Value, arrayIndex: number);
        getNewValue(): Value;
        getArrayIndex(): number;
    }
}
declare module api.form.inputtype {
    class ValueRemovedEvent {
        private arrayIndex;
        constructor(arrayIndex: number);
        getArrayIndex(): number;
    }
}
declare module api.form.inputtype {
    class InputValidationRecording {
        private breaksMinimumOccurrences;
        private breaksMaximumOccurrences;
        private additionalValidationRecord;
        constructor();
        isValid(): boolean;
        setBreaksMinimumOccurrences(value: boolean): void;
        setBreaksMaximumOccurrences(value: boolean): void;
        setAdditionalValidationRecord(value: AdditionalValidationRecord): void;
        isMinimumOccurrencesBreached(): boolean;
        isMaximumOccurrencesBreached(): boolean;
        getAdditionalValidationRecord(): AdditionalValidationRecord;
        equals(that: InputValidationRecording): boolean;
        validityChanged(other: InputValidationRecording): boolean;
    }
}
declare module api.form.inputtype {
    class InputValidityChangedEvent {
        private inputName;
        private recording;
        constructor(recording: InputValidationRecording, inputName: string);
        getInputName(): string;
        isValid(): boolean;
        getRecording(): InputValidationRecording;
    }
}
declare module api.form.inputtype {
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    interface InputTypeView<RAW_VALUE_TYPE> {
        getValueType(): ValueType;
        getElement(): api.dom.Element;
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        update(propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): any;
        newInitialValue(): Value;
        isManagingAdd(): boolean;
        onEditContentRequest(listener: (content: api.content.ContentSummary) => void): any;
        unEditContentRequest(listener: (content: api.content.ContentSummary) => void): any;
        giveFocus(): boolean;
        displayValidationErrors(value: boolean): any;
        hasValidUserInput(): boolean;
        validate(silent: boolean): InputValidationRecording;
        onValidityChanged(listener: (event: InputValidityChangedEvent) => void): any;
        unValidityChanged(listener: (event: InputValidityChangedEvent) => void): any;
        onValueChanged(listener: (event: ValueChangedEvent) => void): any;
        unValueChanged(listener: (event: ValueChangedEvent) => void): any;
        availableSizeChanged(): any;
        onFocus(listener: (event: FocusEvent) => void): any;
        unFocus(listener: (event: FocusEvent) => void): any;
        onBlur(listener: (event: FocusEvent) => void): any;
        unBlur(listener: (event: FocusEvent) => void): any;
    }
}
declare module api.form.inputtype {
    /**
     *      Class to manage input types and their visual representation
     */
    class InputTypeManager {
        private static inputTypes;
        static isRegistered(inputTypeName: string): boolean;
        static register(inputTypeClass: api.Class): void;
        static unregister(inputTypeName: string): void;
        static createView(inputTypeName: string, context: InputTypeViewContext): InputTypeView<any>;
        private static normalize(inputTypeName);
    }
}
declare module api.form.inputtype.support {
    class InputOccurrence extends api.form.FormItemOccurrence<InputOccurrenceView> {
        constructor(inputOccurrences: InputOccurrences, index: number);
    }
}
declare module api.form.inputtype.support {
    import PropertyArray = api.data.PropertyArray;
    class InputOccurrencesBuilder {
        baseInputTypeView: BaseInputTypeNotManagingAdd<any>;
        input: api.form.Input;
        propertyArray: PropertyArray;
        setBaseInputTypeView(value: BaseInputTypeNotManagingAdd<any>): InputOccurrencesBuilder;
        setInput(value: api.form.Input): InputOccurrencesBuilder;
        setPropertyArray(value: PropertyArray): InputOccurrencesBuilder;
        build(): InputOccurrences;
    }
    class InputOccurrences extends api.form.FormItemOccurrences<InputOccurrenceView> {
        private baseInputTypeView;
        private input;
        constructor(config: InputOccurrencesBuilder);
        hasValidUserInput(): boolean;
        moveOccurrence(fromIndex: number, toIndex: number): void;
        getInput(): api.form.Input;
        getAllowedOccurrences(): api.form.Occurrences;
        protected constructOccurrencesForNoData(): api.form.FormItemOccurrence<InputOccurrenceView>[];
        protected constructOccurrencesForData(): api.form.FormItemOccurrence<InputOccurrenceView>[];
        createNewOccurrence(formItemOccurrences: api.form.FormItemOccurrences<InputOccurrenceView>, insertAtIndex: number): api.form.FormItemOccurrence<InputOccurrenceView>;
        createNewOccurrenceView(occurrence: InputOccurrence): InputOccurrenceView;
        updateOccurrenceView(occurrenceView: InputOccurrenceView, propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;
        resetOccurrenceView(occurrenceView: InputOccurrenceView): void;
        private getPropertyFromArray(index);
        giveFocus(): boolean;
        static create(): InputOccurrencesBuilder;
    }
}
declare module api.form.inputtype.support {
    import Property = api.data.Property;
    import PropertyArray = api.data.PropertyArray;
    class InputOccurrenceView extends api.form.FormItemOccurrenceView {
        private inputOccurrence;
        private property;
        private inputTypeView;
        private inputElement;
        private removeButtonEl;
        private dragControl;
        private requiredContractBroken;
        private propertyValueChangedHandler;
        static debug: boolean;
        constructor(inputOccurrence: InputOccurrence, baseInputTypeView: BaseInputTypeNotManagingAdd<any>, property: Property);
        update(propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        private registerProperty(property);
        refresh(): void;
        getDataPath(): api.data.PropertyPath;
        getIndex(): number;
        getInputElement(): api.dom.Element;
        hasValidUserInput(): boolean;
        giveFocus(): boolean;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.form.inputtype.support {
    import Property = api.data.Property;
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import InputTypeView = api.form.inputtype.InputTypeView;
    class BaseInputTypeNotManagingAdd<RAW_VALUE_TYPE> extends api.dom.DivEl implements InputTypeView<RAW_VALUE_TYPE> {
        private context;
        private input;
        protected propertyArray: PropertyArray;
        private inputOccurrences;
        private inputValidityChangedListeners;
        private inputValueChangedListeners;
        private previousValidationRecording;
        /**
         * The index of child Data being dragged.
         */
        private draggingIndex;
        protected ignorePropertyChange: boolean;
        static debug: boolean;
        constructor(context: api.form.inputtype.InputTypeViewContext, className?: string);
        handleDnDStart(event: Event, ui: JQueryUI.SortableUIParams): void;
        handleDnDStop(event: Event, ui: JQueryUI.SortableUIParams): void;
        handleDnDUpdate(event: Event, ui: JQueryUI.SortableUIParams): void;
        availableSizeChanged(): void;
        getContext(): api.form.inputtype.InputTypeViewContext;
        getElement(): api.dom.Element;
        isManagingAdd(): boolean;
        onOccurrenceAdded(listener: (event: api.form.OccurrenceAddedEvent) => void): void;
        onOccurrenceRendered(listener: (event: api.form.OccurrenceRenderedEvent) => void): void;
        onOccurrenceRemoved(listener: (event: api.form.OccurrenceRemovedEvent) => void): void;
        unOccurrenceAdded(listener: (event: api.form.OccurrenceAddedEvent) => void): void;
        unOccurrenceRendered(listener: (event: api.form.OccurrenceRenderedEvent) => void): void;
        unOccurrenceRemoved(listener: (event: api.form.OccurrenceRemovedEvent) => void): void;
        onOccurrenceValueChanged(listener: (occurrence: api.dom.Element, value: api.data.Value) => void): void;
        unOccurrenceValueChanged(listener: (occurrence: api.dom.Element, value: api.data.Value) => void): void;
        protected notifyOccurrenceValueChanged(occurrence: api.dom.Element, value: api.data.Value): void;
        onValueChanged(listener: (event: api.form.inputtype.ValueChangedEvent) => void): void;
        unValueChanged(listener: (event: api.form.inputtype.ValueChangedEvent) => void): void;
        onValidityChanged(listener: (event: api.form.inputtype.InputValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: api.form.inputtype.InputValidityChangedEvent) => void): void;
        private notifyValidityChanged(event);
        maximumOccurrencesReached(): boolean;
        createAndAddOccurrence(): void;
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        update(propertyArray: api.data.PropertyArray, unchangedOnly?: boolean): Q.Promise<void>;
        reset(): void;
        hasValidUserInput(): boolean;
        hasInputElementValidUserInput(inputElement: api.dom.Element): boolean;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        displayValidationErrors(value: boolean): void;
        validate(silent?: boolean): api.form.inputtype.InputValidationRecording;
        protected additionalValidate(recording: api.form.inputtype.InputValidationRecording): void;
        private validateOccurrences();
        protected getPropertyValue(property: Property): string;
        notifyRequiredContractBroken(state: boolean, index: number): void;
        getInput(): api.form.Input;
        valueBreaksRequiredContract(value: Value): boolean;
        createInputOccurrenceElement(index: number, property: Property): api.dom.Element;
        updateInputOccurrenceElement(occurrence: api.dom.Element, property: Property, unchangedOnly?: boolean): void;
        resetInputOccurrenceElement(occurrence: api.dom.Element): void;
        getValueType(): ValueType;
        newInitialValue(): Value;
        giveFocus(): boolean;
        onEditContentRequest(listener: (content: api.content.ContentSummary) => void): void;
        unEditContentRequest(listener: (content: api.content.ContentSummary) => void): void;
    }
}
declare module api.form.inputtype.support {
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import SelectedOptionEvent = api.ui.selector.combobox.SelectedOptionEvent;
    import InputTypeView = api.form.inputtype.InputTypeView;
    class BaseInputTypeManagingAdd<RAW_VALUE_TYPE> extends api.dom.DivEl implements InputTypeView<RAW_VALUE_TYPE> {
        private inputValidityChangedListeners;
        private inputValueChangedListeners;
        private input;
        private previousValidationRecording;
        private layoutInProgress;
        private propertyArray;
        private propertyArrayListener;
        protected ignorePropertyChange: boolean;
        static debug: boolean;
        constructor(className: string);
        protected fireFocusSwitchEvent(event: SelectedOptionEvent<any>): void;
        protected getValueFromPropertyArray(propertyArray: api.data.PropertyArray): string;
        availableSizeChanged(): void;
        getElement(): api.dom.Element;
        isManagingAdd(): boolean;
        getValueType(): ValueType;
        /**
         * Must be overridden by inheritors.
         */
        newInitialValue(): Value;
        /**
         * Must be resolved by inheritors.
         */
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        /**
         * Must be resolved by inheritors.
         */
        update(propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        private registerPropertyArray(propertyArray);
        private ensureOccurrenceLimits(propertyArray);
        hasValidUserInput(): boolean;
        displayValidationErrors(value: boolean): void;
        validate(silent?: boolean, rec?: api.form.inputtype.InputValidationRecording): api.form.inputtype.InputValidationRecording;
        onValidityChanged(listener: (event: api.form.inputtype.InputValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: api.form.inputtype.InputValidityChangedEvent) => void): void;
        notifyValidityChanged(event: api.form.inputtype.InputValidityChangedEvent): void;
        onValueChanged(listener: (event: api.form.inputtype.ValueChangedEvent) => void): void;
        unValueChanged(listener: (event: api.form.inputtype.ValueChangedEvent) => void): void;
        protected notifyValueChanged(event: api.form.inputtype.ValueChangedEvent): void;
        /**
         * Must be overridden by inheritors.
         */
        giveFocus(): boolean;
        onEditContentRequest(listener: (content: api.content.ContentSummary) => void): void;
        unEditContentRequest(listener: (content: api.content.ContentSummary) => void): void;
        protected getInput(): api.form.Input;
        protected getNumberOfValids(): number;
        protected isLayoutInProgress(): boolean;
        protected setLayoutInProgress(layoutInProgress: boolean): void;
        protected getPropertyArray(): PropertyArray;
    }
}
declare module api.form.inputtype.support {
    import Property = api.data.Property;
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import InputTypeView = api.form.inputtype.InputTypeView;
    class BaseInputTypeSingleOccurrence<RAW_VALUE_TYPE> extends api.dom.DivEl implements InputTypeView<RAW_VALUE_TYPE> {
        private context;
        protected input: api.form.Input;
        private property;
        private propertyListener;
        protected ignorePropertyChange: boolean;
        private inputValidityChangedListeners;
        private inputValueChangedListeners;
        constructor(ctx: api.form.inputtype.InputTypeViewContext, className?: string);
        availableSizeChanged(): void;
        getContext(): api.form.inputtype.InputTypeViewContext;
        getElement(): api.dom.Element;
        isManagingAdd(): boolean;
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        layoutProperty(input: api.form.Input, property: Property): wemQ.Promise<void>;
        update(propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        updateProperty(property: Property, unchangedOnly?: boolean): wemQ.Promise<void>;
        protected registerProperty(property: Property): void;
        protected saveToProperty(value: Value): void;
        getProperty(): Property;
        getValueType(): ValueType;
        newInitialValue(): Value;
        displayValidationErrors(value: boolean): void;
        hasValidUserInput(): boolean;
        validate(silent?: boolean): api.form.inputtype.InputValidationRecording;
        protected notifyValidityChanged(event: api.form.inputtype.InputValidityChangedEvent): void;
        onValidityChanged(listener: (event: api.form.inputtype.InputValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: api.form.inputtype.InputValidityChangedEvent) => void): void;
        onValueChanged(listener: (event: api.form.inputtype.ValueChangedEvent) => void): void;
        unValueChanged(listener: (event: api.form.inputtype.ValueChangedEvent) => void): void;
        protected notifyValueChanged(event: api.form.inputtype.ValueChangedEvent): void;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        onEditContentRequest(listener: (content: api.content.ContentSummary) => void): void;
        unEditContentRequest(listener: (content: api.content.ContentSummary) => void): void;
    }
}
declare module api.form.inputtype.support {
    import Property = api.data.Property;
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    class NoInputTypeFoundView extends BaseInputTypeNotManagingAdd<string> {
        constructor(context: api.form.inputtype.InputTypeViewContext);
        getValueType(): ValueType;
        newInitialValue(): Value;
        layout(input: api.form.Input, property?: PropertyArray): wemQ.Promise<void>;
        createInputOccurrenceElement(index: number, property: Property): api.dom.Element;
        updateInputOccurrenceElement(occurrence: api.dom.Element, property: api.data.Property, unchangedOnly: boolean): void;
        resetInputOccurrenceElement(occurrence: api.dom.Element): void;
        valueBreaksRequiredContract(value: Value): boolean;
        hasInputElementValidUserInput(inputElement: api.dom.Element): boolean;
    }
}
declare module api.form.inputtype.combobox {
    interface ComboBoxOption {
        label: string;
        value: string;
    }
}
declare module api.form.inputtype.combobox {
    class ComboBoxDisplayValueViewer extends api.ui.Viewer<string> {
        constructor();
        setObject(value: string): void;
        getPreferredHeight(): number;
    }
}
declare module api.form.inputtype.combobox {
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    class ComboBox extends api.form.inputtype.support.BaseInputTypeManagingAdd<string> {
        private context;
        private comboBoxOptions;
        private comboBox;
        private selectedOptionsView;
        constructor(context: api.form.inputtype.InputTypeViewContext);
        private readConfig(inputConfig);
        getComboBox(): api.ui.selector.combobox.ComboBox<string>;
        availableSizeChanged(): void;
        getValueType(): ValueType;
        newInitialValue(): Value;
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        update(propertyArray: api.data.PropertyArray, unchangedOnly?: boolean): Q.Promise<void>;
        reset(): void;
        createComboBox(input: api.form.Input, propertyArray: PropertyArray): api.ui.selector.combobox.ComboBox<string>;
        giveFocus(): boolean;
        valueBreaksRequiredContract(value: Value): boolean;
        private isExistingValue(value);
        private comboBoxFilter(item, args);
        protected getNumberOfValids(): number;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.form.inputtype.radiobutton {
    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    class RadioButton extends api.form.inputtype.support.BaseInputTypeSingleOccurrence<string> {
        private selector;
        private previousValidationRecording;
        private radioButtonOptions;
        constructor(config: api.form.inputtype.InputTypeViewContext);
        private readConfig(inputConfig);
        getValueType(): ValueType;
        newInitialValue(): Value;
        layoutProperty(input: api.form.Input, property: Property): wemQ.Promise<void>;
        updateProperty(property: api.data.Property, unchangedOnly: boolean): Q.Promise<void>;
        reset(): void;
        giveFocus(): boolean;
        validate(silent?: boolean): api.form.inputtype.InputValidationRecording;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        private createRadioElement(name, property);
        private newValue(s);
        private isValidOption(value);
    }
}
declare module api.content.form.inputtype.checkbox {
    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import BaseInputTypeSingleOccurrence = api.form.inputtype.support.BaseInputTypeSingleOccurrence;
    class Checkbox extends BaseInputTypeSingleOccurrence<boolean> {
        private checkbox;
        private inputAlignment;
        static debug: boolean;
        constructor(config: api.form.inputtype.InputTypeViewContext);
        private readConfig(inputConfig);
        private setInputAlignment(inputAlignmentObj);
        getValueType(): ValueType;
        newInitialValue(): Value;
        layoutProperty(input: api.form.Input, property: Property): wemQ.Promise<void>;
        updateProperty(property: Property, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        giveFocus(): boolean;
        validate(silent?: boolean): api.form.inputtype.InputValidationRecording;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.content.form.inputtype.long {
    import BaseInputTypeNotManagingAdd = api.form.inputtype.support.BaseInputTypeNotManagingAdd;
    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    class Long extends BaseInputTypeNotManagingAdd<number> {
        constructor(config: api.form.inputtype.InputTypeViewContext);
        getValueType(): ValueType;
        newInitialValue(): Value;
        createInputOccurrenceElement(index: number, property: Property): api.dom.Element;
        updateInputOccurrenceElement(occurrence: api.dom.Element, property: api.data.Property, unchangedOnly: boolean): void;
        resetInputOccurrenceElement(occurrence: api.dom.Element): void;
        valueBreaksRequiredContract(value: Value): boolean;
        hasInputElementValidUserInput(inputElement: api.dom.Element): boolean;
        private isValid(value);
    }
}
declare module api.content.form.inputtype.double {
    import BaseInputTypeNotManagingAdd = api.form.inputtype.support.BaseInputTypeNotManagingAdd;
    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    class Double extends BaseInputTypeNotManagingAdd<number> {
        constructor(config: api.form.inputtype.InputTypeViewContext);
        getValueType(): ValueType;
        newInitialValue(): Value;
        createInputOccurrenceElement(index: number, property: Property): api.dom.Element;
        updateInputOccurrenceElement(occurrence: api.dom.Element, property: api.data.Property, unchangedOnly?: boolean): void;
        resetInputOccurrenceElement(occurrence: api.dom.Element): void;
        valueBreaksRequiredContract(value: Value): boolean;
        hasInputElementValidUserInput(inputElement: api.dom.Element): boolean;
        private isValid(value);
    }
}
declare module api.content.form.inputtype.time {
    import support = api.form.inputtype.support;
    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    /**
     * Uses [[api.data.ValueType]] [[api.data.ValueTypeLocalTime]].
     */
    class Time extends support.BaseInputTypeNotManagingAdd<api.util.LocalTime> {
        constructor(config: api.form.inputtype.InputTypeViewContext);
        getValueType(): ValueType;
        newInitialValue(): Value;
        createInputOccurrenceElement(index: number, property: Property): api.dom.Element;
        updateInputOccurrenceElement(occurrence: api.dom.Element, property: api.data.Property, unchangedOnly: boolean): void;
        resetInputOccurrenceElement(occurrence: api.dom.Element): void;
        private getValueFromProperty(property);
        availableSizeChanged(): void;
        valueBreaksRequiredContract(value: Value): boolean;
        hasInputElementValidUserInput(inputElement: api.dom.Element): boolean;
    }
}
declare module api.content.form.inputtype.time {
    import support = api.form.inputtype.support;
    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    /**
     * Uses [[api.data.ValueType]] [[api.data.ValueTypeLocalDate]].
     */
    class Date extends support.BaseInputTypeNotManagingAdd<Date> {
        constructor(config: api.form.inputtype.InputTypeViewContext);
        getValueType(): ValueType;
        newInitialValue(): Value;
        createInputOccurrenceElement(index: number, property: Property): api.dom.Element;
        updateInputOccurrenceElement(occurrence: api.dom.Element, property: api.data.Property, unchangedOnly?: boolean): void;
        resetInputOccurrenceElement(occurrence: api.dom.Element): void;
        valueBreaksRequiredContract(value: Value): boolean;
        hasInputElementValidUserInput(inputElement: api.dom.Element): boolean;
    }
}
declare module api.content.form.inputtype.time {
    import support = api.form.inputtype.support;
    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    /**
     * Uses [[api.data.ValueType]] [[api.data.ValueTypeLocalDateTime]].
     */
    class DateTime extends support.BaseInputTypeNotManagingAdd<Date> {
        private withTimezone;
        private valueType;
        constructor(config: api.form.inputtype.InputTypeViewContext);
        private readConfig(inputConfig);
        getValueType(): ValueType;
        newInitialValue(): Value;
        createInputOccurrenceElement(index: number, property: Property): api.dom.Element;
        updateInputOccurrenceElement(occurrence: api.dom.Element, property: api.data.Property, unchangedOnly: boolean): void;
        resetInputOccurrenceElement(occurrence: api.dom.Element): void;
        hasInputElementValidUserInput(inputElement: api.dom.Element): boolean;
        availableSizeChanged(): void;
        valueBreaksRequiredContract(value: Value): boolean;
        private createInputAsLocalDateTime(property);
        private createInputAsDateTime(property);
        static getName(): api.form.InputTypeName;
    }
}
declare module api.content.form.inputtype.publish {
    /**
     * Uses [[api.data.ValueType]] [[api.data.ValueTypeLocalDateTime]].
     */
    class PublishFrom extends api.content.form.inputtype.time.DateTime {
        protected additionalValidate(recording: api.form.inputtype.InputValidationRecording): void;
        static getName(): api.form.InputTypeName;
    }
}
declare module api.content.form.inputtype.publish {
    /**
     * Uses [[api.data.ValueType]] [[api.data.ValueTypeLocalDateTime]].
     */
    class PublishToFuture extends api.content.form.inputtype.time.DateTime {
        protected additionalValidate(recording: api.form.inputtype.InputValidationRecording): void;
        static getName(): api.form.InputTypeName;
    }
}
declare module api.util.htmlarea.dialog {
    import Form = api.ui.form.Form;
    import Fieldset = api.ui.form.Fieldset;
    import FormItem = api.ui.form.FormItem;
    class ModalDialogFormItemBuilder {
        id: string;
        label: string;
        validator: (input: api.dom.FormInputEl) => string;
        value: string;
        placeholder: string;
        inputEl: api.dom.FormItemEl;
        constructor(id: string, label?: string);
        setValue(value: string): ModalDialogFormItemBuilder;
        setPlaceholder(placeholder: string): ModalDialogFormItemBuilder;
        setValidator(validator: (input: api.dom.FormInputEl) => string): ModalDialogFormItemBuilder;
        setInputEl(inputEl: api.dom.Element): ModalDialogFormItemBuilder;
    }
    class ModalDialog extends api.ui.dialog.ModalDialog {
        private fields;
        private validated;
        private editor;
        private mainForm;
        private firstFocusField;
        private submitAction;
        static CLASS_NAME: string;
        constructor(editor: HtmlAreaEditor, title: string, cls?: string);
        setSubmitAction(action: api.ui.Action): void;
        protected getEditor(): HtmlAreaEditor;
        protected setValidated(): void;
        protected setFirstFocusField(field: api.dom.Element): void;
        private focusFirstField();
        protected layout(): void;
        protected getMainFormItems(): FormItem[];
        protected getMainForm(): Form;
        protected createMainForm(): Form;
        protected validate(): boolean;
        protected hasSubDialog(): boolean;
        show(): void;
        protected createForm(formItems: FormItem[]): Form;
        protected displayValidationErrors(value: boolean): void;
        protected createFormPanel(formItems: FormItem[]): api.ui.panel.Panel;
        createFieldSet(formItem: FormItem): Fieldset;
        onValidatedFieldValueChanged(formItem: FormItem): void;
        private createTextInput(placeholder?);
        protected createFormItem(modalDialogFormItemBuilder: ModalDialogFormItemBuilder): FormItem;
        protected initializeActions(): void;
        protected getFieldById(id: string): api.dom.FormItemEl;
        close(): void;
        private initializeListeners();
        private listenEnterKey();
        private isTextInput(element);
    }
    interface HtmlAreaAnchor {
        editor: HtmlAreaEditor;
        element: HTMLElement;
        text: string;
        anchorList: string[];
        onlyTextSelected: boolean;
    }
    interface HtmlAreaImage {
        editor: HtmlAreaEditor;
        element: HTMLElement;
        container: HTMLElement;
        callback: Function;
    }
    interface HtmlAreaMacro {
        editor: HtmlAreaEditor;
        callback: Function;
    }
}
declare module api.util.htmlarea.dialog {
    import FormItem = api.ui.form.FormItem;
    class LinkModalDialog extends ModalDialog {
        private dockedPanel;
        private link;
        private linkText;
        private onlyTextSelected;
        private textFormItem;
        private toolTipFormItem;
        private content;
        private static tabNames;
        private static contentPrefix;
        private static downloadPrefix;
        private static emailPrefix;
        private static subjectPrefix;
        constructor(config: HtmlAreaAnchor, content: api.content.ContentSummary);
        private getHref();
        private getLinkText();
        private getToolTip();
        private isContentLink();
        private getContentId();
        private isDownloadLink();
        private getDownloadId();
        private isUrl();
        private getUrl();
        private isEmail();
        private getEmail();
        private isAnchor();
        private getAnchor();
        private getSubject();
        protected layout(): void;
        private createContentPanel();
        private createDownloadPanel();
        private createUrlPanel();
        private createAnchorPanel(anchorList);
        private createEmailPanel();
        private static validationRequiredEmail(input);
        private getTarget(isTabSelected);
        private createTargetCheckbox(id, isTabSelectedFn);
        protected getMainFormItems(): FormItem[];
        private createDockedPanel();
        protected initializeActions(): void;
        private createContentSelector(getValueFn, contentTypeNames?);
        private createSelectorFormItem(id, label, contentSelector, addValueValidation?);
        private createAnchorDropdown(anchorList);
        private validateDockPanel();
        protected validate(): boolean;
        private createContentLink();
        private createDownloadLink();
        private createUrlLink();
        private createAnchor();
        private createEmailLink();
        private createLink();
        protected createFormItemWithPostponedValue(id: string, label: string, getValueFn: Function, validator?: (input: api.dom.FormInputEl) => string, placeholder?: string): FormItem;
    }
}
declare module api.util.htmlarea.dialog {
    import FormItem = api.ui.form.FormItem;
    import OptionSelectedEvent = api.ui.selector.OptionSelectedEvent;
    class ImageModalDialog extends ModalDialog {
        private imagePreviewContainer;
        private imageCaptionField;
        private imageAltTextField;
        private imageUploaderEl;
        private imageElement;
        private content;
        private imageSelector;
        private progress;
        private error;
        private image;
        private elementContainer;
        private callback;
        private imageToolbar;
        private imagePreviewScrollHandler;
        private imageLoadMask;
        private dropzoneContainer;
        private imageSelectorFormItem;
        static imagePrefix: string;
        static maxImageWidth: number;
        constructor(config: HtmlAreaImage, content: api.content.ContentSummary);
        private setImageFieldValues(field, value);
        private initLoader();
        private loadImage();
        protected getMainFormItems(): FormItem[];
        private createImageSelector(id);
        private addUploaderAndPreviewControls();
        private getImageContent(images);
        private createImgElForExistingImage(imageContent);
        private createImgElForNewImage(imageContent);
        private previewImage();
        private createImgElForPreview(imageContent, isExistingImg?);
        private generateDefaultImgSrc(contentId);
        private removePreview();
        show(): void;
        private createImagePreviewContainer();
        private resetPreviewContainerMaxHeight();
        private getCaption();
        private getAltText();
        private createImageUploader();
        private initDragAndDropUploaderEvents();
        private setProgress(value);
        private showProgress();
        private hideUploadMasks();
        private showError(text);
        protected initializeActions(): void;
        private getCaptionFieldValue();
        private setCaptionFieldValue(value);
        private getAltTextFieldValue();
        private setAltTextFieldValue(value);
        private fetchImageCaption(imageContent);
        private getDescriptionFromImageContent(imageContent);
        private isImageWiderThanEditor();
        private createFigureElement();
        private createImageTag();
        private setImageWidthConstraint();
        private isImageInOriginalSize(image);
    }
    class ImageToolbar extends api.ui.toolbar.Toolbar {
        private image;
        private justifyButton;
        private alignLeftButton;
        private centerButton;
        private alignRightButton;
        private keepOriginalSizeCheckbox;
        private imageCroppingSelector;
        private imageLoadMask;
        constructor(image: api.dom.ImgEl, imageLoadMask: api.ui.mask.LoadMask);
        private createJustifiedButton();
        private createLeftAlignedButton();
        private createCenteredButton();
        private createRightAlignedButton();
        private createAlignmentButton(iconClass);
        private createKeepOriginalSizeCheckbox();
        private createImageCroppingSelector();
        private initSelectedCropping(imageCroppingSelector);
        private initActiveButton();
        private resetActiveButton();
        private initKeepSizeCheckbox();
        private getImageAlignment();
        private rebuildImgSrcParams();
        private rebuildImgDataSrcParams();
        onCroppingChanged(listener: (event: OptionSelectedEvent<ImageCroppingOption>) => void): void;
    }
    class ImagePreviewScrollHandler {
        private imagePreviewContainer;
        private scrollDownButton;
        private scrollUpButton;
        private scrollBarWidth;
        private scrollBarRemoveTimeoutId;
        private scrolling;
        constructor(imagePreviewContainer: api.dom.DivEl);
        private initializeImageScrollNavigation();
        private isScrolledToTop();
        private isScrolledToBottom();
        private createScrollButton(direction);
        private initScrollbarWidth();
        private scrollImagePreview(direction, scrollBy?);
        setMarginRight(): void;
        toggleScrollButtons(): void;
        resetScrollPosition(): void;
        private showScrollBar();
        private removeScrollBarOnTimeout();
    }
}
declare module api.util.htmlarea.dialog {
    import FormItem = api.ui.form.FormItem;
    class AnchorModalDialog extends ModalDialog {
        constructor(editor: HtmlAreaEditor);
        protected getMainFormItems(): FormItem[];
        protected initializeActions(): void;
        private createAnchorEl();
        private getName();
        private insertAnchor();
    }
}
declare module api.util.htmlarea.dialog {
    import MacroDescriptor = api.macro.MacroDescriptor;
    import MacroPreview = api.macro.MacroPreview;
    import FormView = api.form.FormView;
    import DockedPanel = api.ui.panel.DockedPanel;
    class MacroDockedPanel extends DockedPanel {
        private static CONFIGURATION_TAB_NAME;
        private static PREVIEW_TAB_NAME;
        private static MACRO_FORM_INCOMPLETE_MES;
        private static PREVIEW_LOAD_ERROR_MESSAGE;
        private configPanel;
        private previewPanel;
        private content;
        private macroDescriptor;
        private previewResolved;
        private macroPreview;
        private data;
        private previewPanelLoadMask;
        private configPanelLoadMask;
        private formValueChangedHandler;
        private panelRenderedListeners;
        constructor();
        setContent(content: api.content.ContentSummary): void;
        private createConfigurationPanel();
        private createPreviewPanel();
        private handlePreviewPanelShowEvent();
        private handleConfigPanelShowEvent();
        private fetchPreview();
        private fetchMacroString();
        getMacroPreviewString(): wemQ.Promise<string>;
        private renderPreviewWithMessage(message);
        private renderPreview(macroPreview);
        private makePreviewFrame(macroPreview);
        getConfigForm(): FormView;
        validateMacroForm(): boolean;
        setMacroDescriptor(macroDescriptor: MacroDescriptor): void;
        private showDescriptorConfigView(macroDescriptor);
        private initPropertySetForDescriptor();
        private renderConfigView(formView);
        onPanelRendered(listener: () => void): void;
        unPanelRendered(listener: () => void): void;
        private notifyPanelRendered();
    }
    class MacroPreviewFrame extends api.dom.IFrameEl {
        private id;
        private macroPreview;
        private debouncedResizeHandler;
        private previewRenderedListeners;
        constructor(macroPreview: MacroPreview);
        private initFrameContent(macroPreview);
        private isYoutubePreview();
        private isInstagramPreview();
        private adjustFrameHeightOnContentsUpdate();
        private adjustFrameHeight();
        private getMaxFrameHeight();
        private makeContentForPreviewFrame(macroPreview);
        onPreviewRendered(listener: () => void): void;
        unPreviewRendered(listener: () => void): void;
        private notifyPreviewRendered();
    }
}
declare module api.util.htmlarea.dialog {
    import FormItem = api.ui.form.FormItem;
    import ApplicationKey = api.application.ApplicationKey;
    class MacroModalDialog extends ModalDialog {
        private macroDockedPanel;
        private macroSelector;
        private callback;
        constructor(config: HtmlAreaMacro, content: api.content.ContentSummary, applicationKeys: ApplicationKey[]);
        protected layout(): void;
        private makeMacroDockedPanel();
        protected getMainFormItems(): FormItem[];
        private createMacroSelector(id);
        protected initializeActions(): void;
        private insertMacroIntoTextArea();
        protected validate(): boolean;
    }
}
declare module api.util.htmlarea.dialog {
    import ContentPath = api.content.ContentPath;
    import ContentSummary = api.content.ContentSummary;
    import ApplicationKey = api.application.ApplicationKey;
    enum HtmlAreaDialogType {
        ANCHOR = 0,
        IMAGE = 1,
        LINK = 2,
        MACRO = 3,
        SEARCHREPLACE = 4,
        CODE = 5,
        CHARMAP = 6,
    }
    class CreateHtmlAreaDialogEvent extends api.event.Event {
        private config;
        private type;
        private content;
        private contentPath;
        private applicationKeys;
        constructor(builder: HtmlAreaDialogShownEventBuilder);
        getConfig(): any;
        getType(): HtmlAreaDialogType;
        getContent(): ContentSummary;
        getContentPath(): ContentPath;
        getApplicationKeys(): ApplicationKey[];
        static create(): HtmlAreaDialogShownEventBuilder;
        static on(handler: (event: CreateHtmlAreaDialogEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: CreateHtmlAreaDialogEvent) => void, contextWindow?: Window): void;
    }
    class HtmlAreaDialogShownEventBuilder {
        config: any;
        type: HtmlAreaDialogType;
        content: ContentSummary;
        contentPath: ContentPath;
        applicationKeys: ApplicationKey[];
        setContent(content: ContentSummary): HtmlAreaDialogShownEventBuilder;
        setContentPath(contentPath: ContentPath): HtmlAreaDialogShownEventBuilder;
        setType(type: HtmlAreaDialogType): HtmlAreaDialogShownEventBuilder;
        setConfig(config: any): HtmlAreaDialogShownEventBuilder;
        setApplicationKeys(applicationKeys: ApplicationKey[]): HtmlAreaDialogShownEventBuilder;
        build(): CreateHtmlAreaDialogEvent;
    }
}
declare module api.util.htmlarea.dialog {
    class HTMLAreaDialogHandler {
        private static modalDialog;
        static createAndOpenDialog(event: CreateHtmlAreaDialogEvent): ModalDialog;
        static getOpenDialog(): ModalDialog;
        private static openLinkDialog(config, content);
        private static openImageDialog(config, content);
        private static openAnchorDialog(editor);
        private static openMacroDialog(config, content, applicationKeys);
        private static openSearchReplaceDialog(editor);
        private static openCodeDialog(editor);
        private static openCharMapDialog(editor);
        private static openDialog(dialog);
    }
}
declare module api.util.htmlarea.dialog {
    class ImageCroppingNameView extends api.dom.DivEl {
        private mainNameEl;
        private addTitleAttribute;
        constructor(addTitleAttribute?: boolean);
        setMainName(value: string): ImageCroppingNameView;
    }
}
declare module api.util.htmlarea.dialog {
    class ImageCroppingOption {
        private name;
        private displayValue;
        private widthProportion;
        private heightProportion;
        constructor(name: string, widthProportion: number, heightProportion: number);
        getName(): string;
        getDisplayValue(): string;
        setDisplayValue(value: string): void;
        getProportionString(): string;
    }
}
declare module api.util.htmlarea.dialog {
    import Option = api.ui.selector.Option;
    class ImageCroppingOptions {
        static SQUARE: ImageCroppingOption;
        static REGULAR: ImageCroppingOption;
        static WIDESCREEN: ImageCroppingOption;
        static CINEMA: ImageCroppingOption;
        static PORTRAIT: ImageCroppingOption;
        static TALL: ImageCroppingOption;
        static SKYSCRAPER: ImageCroppingOption;
        static getOptions(): Option<ImageCroppingOption>[];
        static getCroppingOptions(): ImageCroppingOption[];
        static getOptionByProportion(proportion: string): ImageCroppingOption;
    }
}
declare module api.util.htmlarea.dialog {
    class ImageCroppingOptionViewer extends api.ui.Viewer<ImageCroppingOption> {
        private nameView;
        constructor();
        setObject(object: ImageCroppingOption): void;
        getPreferredHeight(): number;
    }
}
declare module api.util.htmlarea.dialog {
    import Dropdown = api.ui.selector.dropdown.Dropdown;
    import Option = api.ui.selector.Option;
    class ImageCroppingSelector extends Dropdown<ImageCroppingOption> {
        constructor();
        private initDropdown();
        private addNoneOption();
        private addCroppingOptions();
        addCustomScaleOption(value: string): Option<ImageCroppingOption>;
    }
}
declare module api.util.htmlarea.dialog {
    import FormItem = api.ui.form.FormItem;
    class SearchReplaceModalDialog extends ModalDialog {
        private findInput;
        private replaceInput;
        private matchCaseCheckbox;
        private wholeWordsCheckbox;
        private nextAction;
        private prevAction;
        private replaceAction;
        private replaceAllAction;
        private findAction;
        private searchAndReplaceHelper;
        constructor(editor: HtmlAreaEditor);
        protected getMainFormItems(): FormItem[];
        private createCheckbox(id, label);
        protected initializeActions(): void;
        private setupListeners();
        private updateActions(enabled);
        private createReplaceAction();
        private createReplaceAllAction();
        private createPrevAction();
        private createNextAction();
        open(): void;
        close(): void;
        private updateButtonStates();
    }
}
declare module api.util.htmlarea.dialog {
    class CodeDialog extends ModalDialog {
        private textArea;
        constructor(editor: HtmlAreaEditor);
        protected layout(): void;
        open(): void;
        private resetHeight();
        protected initializeActions(): void;
    }
}
declare module api.util.htmlarea.dialog {
    class CharMapDialog extends ModalDialog {
        constructor(editor: HtmlAreaEditor);
        protected layout(): void;
        private createSpecialCharsGrid();
        private createSpecialCharsGridHtml();
        private getParentTd(elm);
        private charmapFilter(charmap);
        private getCharsFromSetting(settingValue);
        private extendCharMap(charmap);
        private getCharMap();
        private insertChar(chr);
        private getDefaultCharMap();
    }
}
declare module api.util.htmlarea.editor {
    class HTMLAreaHelper {
        private static getConvertedImageSrc(imgSrc);
        private static extractContentIdFromImgSrc(imgSrc);
        private static extractScaleParamFromImgSrc(imgSrc);
        static prepareImgSrcsInValueForEdit(value: string): string;
        static prepareEditorImageSrcsBeforeSave(editor: HtmlAreaEditor): string;
        static updateImageAlignmentBehaviour(editor: HtmlAreaEditor): void;
        static changeImageParentAlignmentOnImageAlignmentChange(img: HTMLImageElement): void;
        static updateImageParentAlignment(image: HTMLElement, alignment?: string): void;
        private static isImageInOriginalSize(image);
    }
}
declare module api.util.htmlarea.editor {
    import CreateHtmlAreaDialogEvent = api.util.htmlarea.dialog.CreateHtmlAreaDialogEvent;
    import ApplicationKey = api.application.ApplicationKey;
    class HTMLAreaBuilder {
        private content;
        private contentPath;
        private applicationKeys;
        private assetsUri;
        private selector;
        private focusHandler;
        private blurHandler;
        private keydownHandler;
        private keyupHandler;
        private nodeChangeHandler;
        private createDialogListeners;
        private inline;
        private fixedToolbarContainer;
        private convertUrls;
        private hasActiveDialog;
        private customToolConfig;
        private editableSourceCode;
        private forcedRootBlock;
        private tools;
        private plugins;
        setEditableSourceCode(value: boolean): HTMLAreaBuilder;
        setAssetsUri(assetsUri: string): HTMLAreaBuilder;
        setSelector(selector: string): HTMLAreaBuilder;
        onCreateDialog(listener: (event: CreateHtmlAreaDialogEvent) => void): this;
        unCreateDialog(listener: (event: CreateHtmlAreaDialogEvent) => void): this;
        private notifyCreateDialog(event);
        setFocusHandler(focusHandler: (e: FocusEvent) => void): HTMLAreaBuilder;
        setBlurHandler(blurHandler: (e: FocusEvent) => void): HTMLAreaBuilder;
        setKeydownHandler(keydownHandler: (e: KeyboardEvent) => void): HTMLAreaBuilder;
        setKeyupHandler(keyupHandler: (e: KeyboardEvent) => void): HTMLAreaBuilder;
        setNodeChangeHandler(nodeChangeHandler: (e: any) => void): HTMLAreaBuilder;
        setInline(inline: boolean): HTMLAreaBuilder;
        setFixedToolbarContainer(fixedToolbarContainer: string): HTMLAreaBuilder;
        setContent(content: api.content.ContentSummary): HTMLAreaBuilder;
        setContentPath(contentPath: api.content.ContentPath): HTMLAreaBuilder;
        setConvertUrls(convertUrls: boolean): HTMLAreaBuilder;
        setApplicationKeys(applicationKeys: ApplicationKey[]): HTMLAreaBuilder;
        private excludeTools(tools);
        private includeTools(tools);
        private includeTool(tool);
        setTools(tools: any): HTMLAreaBuilder;
        setForcedRootBlock(el: string): HTMLAreaBuilder;
        private checkRequiredFieldsAreSet();
        createEditor(): wemQ.Promise<HtmlAreaEditor>;
        private getExternalPlugins();
        private notifyLinkDialog(config);
        private notifyImageDialog(config);
        private notifyAnchorDialog(config);
        private notifyMacroDialog(config);
        private notifySearchReplaceDialog(config);
        private notifyCodeDialog(config);
        private notifyCharMapDialog(config);
        private publishCreateDialogEvent(event);
        private isToolExcluded(tool);
    }
}
declare module api.form.inputtype.text {
    import support = api.form.inputtype.support;
    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    class TextLine extends support.BaseInputTypeNotManagingAdd<string> {
        private regexpStr;
        private regexp;
        constructor(config: api.form.inputtype.InputTypeViewContext);
        private readConfig(inputConfig);
        getValueType(): ValueType;
        newInitialValue(): Value;
        createInputOccurrenceElement(index: number, property: Property): api.dom.Element;
        updateInputOccurrenceElement(occurrence: api.dom.Element, property: api.data.Property, unchangedOnly: boolean): void;
        resetInputOccurrenceElement(occurrence: api.dom.Element): void;
        availableSizeChanged(): void;
        valueBreaksRequiredContract(value: Value): boolean;
        hasInputElementValidUserInput(inputElement: api.dom.Element): boolean;
        private isValid(value, textInput, silent?);
        static getName(): api.form.InputTypeName;
    }
}
declare module api.form.inputtype.text {
    import support = api.form.inputtype.support;
    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    class TextArea extends support.BaseInputTypeNotManagingAdd<string> {
        constructor(config: api.form.inputtype.InputTypeViewContext);
        getValueType(): ValueType;
        newInitialValue(): Value;
        createInputOccurrenceElement(index: number, property: Property): api.dom.Element;
        updateInputOccurrenceElement(occurrence: api.dom.Element, property: api.data.Property, unchangedOnly: boolean): void;
        resetInputOccurrenceElement(occurrence: api.dom.Element): void;
        private newValue(s);
        valueBreaksRequiredContract(value: Value): boolean;
        hasInputElementValidUserInput(inputElement: api.dom.Element): boolean;
        static getName(): api.form.InputTypeName;
    }
}
declare module api.form.inputtype.text {
    import support = api.form.inputtype.support;
    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import Element = api.dom.Element;
    class HtmlArea extends support.BaseInputTypeNotManagingAdd<string> {
        private editors;
        private content;
        private contentPath;
        private applicationKeys;
        private focusListeners;
        private blurListeners;
        private authRequest;
        private editableSourceCode;
        private inputConfig;
        constructor(config: api.content.form.inputtype.ContentInputTypeViewContext);
        getValueType(): ValueType;
        newInitialValue(): Value;
        createInputOccurrenceElement(index: number, property: Property): api.dom.Element;
        updateInputOccurrenceElement(occurrence: api.dom.Element, property: api.data.Property, unchangedOnly: boolean): void;
        resetInputOccurrenceElement(occurrence: api.dom.Element): void;
        private initEditor(id, property, textAreaWrapper);
        private setFocusOnEditorAfterCreate(inputOccurence, id);
        private setupStickyEditorToolbarForInputOccurence(inputOccurence, editorId);
        private updateStickyEditorToolbar(inputOccurence, editorInfo);
        private updateEditorToolbarPos(inputOccurence);
        private updateEditorToolbarWidth(inputOccurence, editorInfo);
        private editorTopEdgeIsVisible(inputOccurence);
        private editorLowerEdgeIsVisible(inputOccurence);
        private calcDistToTopOfScrlbleArea(inputOccurence);
        private getToolbarOffsetTop(delta?);
        private resetInputHeight();
        private setStaticInputHeight();
        private getEditor(editorId);
        isDirty(): boolean;
        private setEditorContent(editorId, property);
        private notInLiveEdit();
        private notifyValueChanged(id, occurrence);
        private newValue(s);
        private isNotActiveElement(htmlAreaIframe);
        private isIframe(element);
        valueBreaksRequiredContract(value: Value): boolean;
        hasInputElementValidUserInput(inputElement: api.dom.Element): boolean;
        private removeTooltipFromEditorArea(inputOccurence);
        handleDnDStart(event: Event, ui: JQueryUI.SortableUIParams): void;
        handleDnDStop(event: Event, ui: JQueryUI.SortableUIParams): void;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        private notifyFocused(event);
        private notifyBlurred(event);
        private destroyEditor(id);
        private reInitEditor(id);
        private getEditorInfo(id);
    }
    interface HtmlAreaOccurrenceInfo {
        id: string;
        textAreaWrapper: Element;
        textAreaEl: api.ui.text.TextArea;
        property: Property;
        hasStickyToolbar: boolean;
    }
}
declare module api.form.inputtype.text {
    import Event = api.event.Event;
    class HtmlAreaResizeEvent extends Event {
        private htmlArea;
        constructor(htmlArea: HtmlArea);
        getHtmlArea(): HtmlArea;
        static on(handler: (event: HtmlAreaResizeEvent) => void): void;
        static un(handler?: (event: HtmlAreaResizeEvent) => void): void;
    }
}
declare module api.site.json {
    interface SiteDescriptorJson {
        form: api.form.json.FormJson;
        metaSteps: string[];
    }
}
declare module api.site {
    import Form = api.form.Form;
    import MixinNames = api.schema.mixin.MixinNames;
    class SiteDescriptor implements api.Equitable {
        private form;
        private metaSteps;
        constructor(form: Form, mixinNames: MixinNames);
        getForm(): Form;
        getMetaSteps(): api.schema.mixin.MixinNames;
        static fromJson(json: api.site.json.SiteDescriptorJson): SiteDescriptor;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.item {
    interface ItemJson {
        id: string;
        createdTime: string;
        modifiedTime: string;
        editable: boolean;
        deletable: boolean;
    }
}
declare module api.item {
    interface Item {
        getId(): string;
        getCreatedTime(): Date;
        getModifiedTime(): Date;
        isDeletable(): boolean;
        isEditable(): boolean;
    }
}
declare module api.item {
    class BaseItem implements Item, api.Equitable {
        private id;
        private createdTime;
        private modifiedTime;
        private deletable;
        private editable;
        constructor(builder: BaseItemBuilder);
        getId(): string;
        getCreatedTime(): Date;
        getModifiedTime(): Date;
        isDeletable(): boolean;
        isEditable(): boolean;
        equals(o: api.Equitable): boolean;
    }
    class BaseItemBuilder {
        id: string;
        createdTime: Date;
        modifiedTime: Date;
        deletable: boolean;
        editable: boolean;
        constructor(source?: BaseItem);
        fromBaseItemJson(json: ItemJson, idProperty?: string): BaseItemBuilder;
        build(): BaseItem;
    }
}
declare module api.query.expr {
    interface Expression {
    }
}
declare module api.query.expr {
    interface ConstraintExpr extends Expression {
    }
}
declare module api.query.expr {
    class CompareExpr implements ConstraintExpr {
        private field;
        private operator;
        private values;
        constructor(field: FieldExpr, operator: CompareOperator, values: ValueExpr[]);
        getField(): FieldExpr;
        getOperator(): CompareOperator;
        getFirstValue(): ValueExpr;
        getValues(): ValueExpr[];
        toString(): string;
        static eq(field: FieldExpr, value: ValueExpr): CompareExpr;
        static neq(field: FieldExpr, value: ValueExpr): CompareExpr;
        static gt(field: FieldExpr, value: ValueExpr): CompareExpr;
        static gte(field: FieldExpr, value: ValueExpr): CompareExpr;
        static lt(field: FieldExpr, value: ValueExpr): CompareExpr;
        static lte(field: FieldExpr, value: ValueExpr): CompareExpr;
        static like(field: FieldExpr, value: ValueExpr): CompareExpr;
        static notLike(field: FieldExpr, value: ValueExpr): CompareExpr;
        static In(field: FieldExpr, values: ValueExpr[]): CompareExpr;
        static notIn(field: FieldExpr, values: ValueExpr[]): CompareExpr;
        static create(field: FieldExpr, operator: CompareOperator, values: ValueExpr[]): CompareExpr;
        private operatorAsString();
        private allowMultipleValues();
    }
}
declare module api.query.expr {
    class OrderExpr implements Expression {
        private direction;
        constructor(direction: OrderDirection);
        getDirection(): OrderDirection;
        directionAsString(): string;
    }
}
declare module api.query.expr {
    class QueryExpr implements Expression {
        private constraint;
        private orderList;
        constructor(constraint: ConstraintExpr, orderList?: OrderExpr[]);
        getConstraint(): ConstraintExpr;
        getOrderList(): OrderExpr[];
        toString(): string;
    }
}
declare module api.query.expr {
    class ValueExpr implements Expression {
        private value;
        constructor(value: api.data.Value);
        getValue(): api.data.Value;
        static stringValue(value: string): ValueExpr;
        toString(): string;
        private typecastFunction(name, argument);
        private quoteString(value);
        static string(value: string): ValueExpr;
        static number(value: Number): ValueExpr;
        static dateTime(value: Date): ValueExpr;
        static geoPoint(value: string): ValueExpr;
    }
}
declare module api.query.expr {
    class FunctionExpr implements Expression {
        private name;
        private args;
        constructor(name: string, args: ValueExpr[]);
        getName(): string;
        getargs(): ValueExpr[];
        toString(): string;
    }
}
declare module api.query.expr {
    class FieldExpr implements Expression {
        private name;
        constructor(name: string);
        getName(): string;
        toString(): string;
    }
}
declare module api.query.expr {
    class DynamicConstraintExpr implements ConstraintExpr {
        private func;
        constructor(func: FunctionExpr);
        getFunction(): FunctionExpr;
        toString(): string;
    }
}
declare module api.query.expr {
    class DynamicOrderExpr extends OrderExpr {
        private func;
        constructor(func: FunctionExpr, direction: OrderDirection);
        getFunction(): FunctionExpr;
        toString(): string;
    }
}
declare module api.query.expr {
    class FieldOrderExpr extends OrderExpr {
        private field;
        constructor(field: FieldExpr, direction: OrderDirection);
        getField(): FieldExpr;
        toString(): string;
    }
}
declare module api.query.expr {
    class LogicalExpr implements ConstraintExpr {
        private left;
        private right;
        private operator;
        constructor(left: ConstraintExpr, operator: LogicalOperator, right: ConstraintExpr);
        getLeft(): ConstraintExpr;
        getRight(): ConstraintExpr;
        getOperator(): LogicalOperator;
        toString(): string;
        static and(left: ConstraintExpr, right: ConstraintExpr): LogicalExpr;
        static or(left: ConstraintExpr, right: ConstraintExpr): LogicalExpr;
        private operatorAsString();
    }
}
declare module api.query.expr {
    class NotExpr implements ConstraintExpr {
        private expr;
        constructor(expr: ConstraintExpr);
        getExpression(): Expression;
        toString(): string;
    }
}
declare module api.query.expr {
    enum CompareOperator {
        EQ = 0,
        NEQ = 1,
        GT = 2,
        GTE = 3,
        LT = 4,
        LTE = 5,
        LIKE = 6,
        NOT_LIKE = 7,
        IN = 8,
        NOT_IN = 9,
    }
}
declare module api.query.expr {
    enum LogicalOperator {
        AND = 0,
        OR = 1,
    }
}
declare module api.query.expr {
    enum OrderDirection {
        ASC = 0,
        DESC = 1,
    }
}
declare module api.query {
    class SearchInputValues {
        textSearchFieldValue: string;
        aggregationSelections: api.aggregation.AggregationSelection[];
        setAggregationSelections(aggregationSelections: api.aggregation.AggregationSelection[]): void;
        setTextSearchFieldValue(textSearchFieldValue: string): void;
        getTextSearchFieldValue(): string;
        getSelectedValuesForAggregationName(name: string): api.aggregation.Bucket[];
    }
}
declare module api.query {
    class FulltextSearchExpression {
        static create(searchString: string, queryFields: QueryFields): api.query.expr.Expression;
    }
    class FulltextSearchExpressionBuilder {
        queryFields: QueryFields;
        searchString: string;
        addField(queryField: QueryField): FulltextSearchExpressionBuilder;
        setSearchString(searchString: string): FulltextSearchExpressionBuilder;
        build(): api.query.expr.Expression;
    }
}
declare module api.query {
    class PathMatchExpression extends FulltextSearchExpression {
        static createWithPath(searchString: string, queryFields: QueryFields, path: string): api.query.expr.Expression;
        private static createPathMatchExpression(searchString);
        private static createSearchString(searchString);
    }
    class PathMatchExpressionBuilder extends FulltextSearchExpressionBuilder {
        path: string;
        addField(queryField: QueryField): PathMatchExpressionBuilder;
        setSearchString(searchString: string): PathMatchExpressionBuilder;
        setPath(path: string): PathMatchExpressionBuilder;
        build(): api.query.expr.Expression;
    }
}
declare module api.query {
    class QueryField {
        static DISPLAY_NAME: string;
        static NAME: string;
        static ALL: string;
        static MODIFIED_TIME: string;
        static TIMESTAMP: string;
        static MANUAL_ORDER_VALUE: string;
        static WEIGHT_SEPARATOR: string;
        static CONTENT_TYPE: string;
        static REFERENCES: string;
        static ID: string;
        weight: number;
        name: string;
        constructor(name: string, weight?: number);
        toString(): string;
    }
}
declare module api.query {
    class QueryFields {
        queryFields: QueryField[];
        add(queryField: QueryField): void;
        toString(): string;
    }
}
declare module api.query.aggregation {
    class AggregationQuery {
        private name;
        toJson(): api.query.aggregation.AggregationQueryTypeWrapperJson;
        toAggregationQueryJson(): api.query.aggregation.AggregationQueryJson;
        constructor(name: string);
        getName(): string;
    }
}
declare module api.query.aggregation {
    interface AggregationQueryJson {
        name: string;
    }
}
declare module api.query.aggregation {
    interface AggregationQueryTypeWrapperJson {
        TermsAggregationQuery?: api.query.aggregation.TermsAggregationQueryJson;
        DateRangeAggregationQuery?: api.query.aggregation.DateRangeAggregationQueryJson;
    }
}
declare module api.query.aggregation {
    class TermsAggregationQuery extends AggregationQuery {
        static TERM_DEFAULT_SIZE: number;
        private fieldName;
        private size;
        private orderByDirection;
        private orderByType;
        toJson(): AggregationQueryTypeWrapperJson;
        constructor(name: string);
        setFieldName(fieldName: string): void;
        getFieldName(): string;
        setSize(size: number): void;
        getSize(): number;
        setOrderByType(type: string): void;
        setOrderByDirection(direction: string): void;
    }
    class TermsAggregationOrderDirection {
        static ASC: string;
        static DESC: string;
    }
    class TermsAggregationOrderType {
        static DOC_COUNT: string;
        static TERM: string;
    }
}
declare module api.query.aggregation {
    interface TermsAggregationQueryJson {
        name: string;
        fieldName: string;
        size: number;
        orderByDirection: string;
        orderByType: string;
    }
}
declare module api.query.aggregation {
    class DateRangeAggregationQuery extends AggregationQuery {
        private fieldName;
        private ranges;
        constructor(name: string);
        setFieldName(fieldName: string): void;
        getFieldName(): string;
        addRange(range: DateRange): void;
        toJson(): AggregationQueryTypeWrapperJson;
    }
}
declare module api.query.aggregation {
    interface DateRangeAggregationQueryJson {
        name: string;
        fieldName: string;
        ranges: api.query.aggregation.DateRangeJson[];
    }
}
declare module api.query.aggregation {
    class Range {
        private key;
        constructor(key?: string);
        setKey(key: string): void;
        getKey(): string;
        toRangeJson(): api.query.aggregation.RangeJson;
    }
}
declare module api.query.aggregation {
    interface RangeJson {
        key?: string;
    }
}
declare module api.query.aggregation {
    class DateRange extends Range {
        private to;
        private from;
        constructor(from: string, to: string, key?: string);
        setTo(to: string): void;
        setFrom(from: string): void;
        setToDate(to: Date): void;
        setFromDate(from: Date): void;
        toJson(): api.query.aggregation.DateRangeJson;
    }
}
declare module api.query.aggregation {
    interface DateRangeJson extends RangeJson {
        to?: string;
        from?: string;
    }
}
declare module api.query.filter {
    class Filter {
        toJson(): api.query.filter.FilterTypeWrapperJson;
    }
}
declare module api.query.filter {
    class BooleanFilter extends Filter {
        private must;
        private mustNot;
        private should;
        addMust(must: api.query.filter.Filter): void;
        addMustNot(mustNot: api.query.filter.Filter): void;
        addShould(should: api.query.filter.Filter): void;
        toJson(): api.query.filter.FilterTypeWrapperJson;
        toJsonWrapperElements(filters: api.query.filter.Filter[]): api.query.filter.FilterTypeWrapperJson[];
    }
}
declare module api.query.filter {
    interface BooleanFilterJson {
        must: api.query.filter.FilterTypeWrapperJson[];
        mustNot: api.query.filter.FilterTypeWrapperJson[];
        should: api.query.filter.FilterTypeWrapperJson[];
    }
}
declare module api.query.filter {
    interface FilterTypeWrapperJson {
        RangeFilter?: api.query.filter.RangeFilterJson;
        BooleanFilter?: api.query.filter.BooleanFilterJson;
    }
}
declare module api.query.filter {
    class RangeFilter extends api.query.filter.Filter {
        private from;
        private to;
        private fieldName;
        constructor(fieldName: string, from: api.data.Value, to: api.data.Value);
        toJson(): api.query.filter.FilterTypeWrapperJson;
    }
}
declare module api.query.filter {
    interface RangeFilterJson {
        from: string;
        to: string;
        fieldName: string;
    }
}
declare module api.application {
    class ResourcePath extends api.util.BasePath<ResourcePath> {
        private static ELEMENT_DIVIDER;
        static fromString(s: string): ResourcePath;
        constructor(elements: string[], absolute?: boolean);
        newInstance(elements: string[], absolute: boolean): ResourcePath;
    }
}
declare module api.application {
    class ApplicationKey implements api.Equitable {
        static SYSTEM: ApplicationKey;
        static BASE: ApplicationKey;
        static PORTAL: ApplicationKey;
        static MEDIA: ApplicationKey;
        static SYSTEM_RESERVED_APPLICATION_KEYS: ApplicationKey[];
        private name;
        static fromString(applicationName: string): ApplicationKey;
        constructor(applicationName: string);
        getName(): string;
        isSystemReserved(): boolean;
        toString(): string;
        equals(o: api.Equitable): boolean;
        static toStringArray(keys: ApplicationKey[]): string[];
        static fromApplications(applications: Application[]): ApplicationKey[];
        static fromClusterApplications(applications: Application[]): ApplicationKey[];
    }
}
declare module api.application {
    class ApplicationResourceKey {
        private static SEPARATOR;
        private applicationKey;
        private path;
        private refString;
        static fromString(str: string): ApplicationResourceKey;
        constructor(applicationKey: ApplicationKey, path: ResourcePath);
        getApplicationKey(): ApplicationKey;
        getPath(): ResourcePath;
        toString(): string;
    }
}
declare module api.application {
    import UploadItem = api.ui.uploader.UploadItem;
    class Application extends api.item.BaseItem {
        static STATE_STARTED: string;
        static STATE_STOPPED: string;
        private applicationKey;
        private displayName;
        private description;
        private vendorName;
        private vendorUrl;
        private url;
        private state;
        private version;
        private local;
        private config;
        private authConfig;
        private applicationDependencies;
        private contentTypeDependencies;
        private metaSteps;
        private minSystemVersion;
        private maxSystemVersion;
        private iconUrl;
        constructor(builder: ApplicationBuilder);
        getDisplayName(): string;
        getDescription(): string;
        getApplicationKey(): ApplicationKey;
        getVersion(): string;
        isLocal(): boolean;
        getName(): string;
        getVendorName(): string;
        getVendorUrl(): string;
        getUrl(): string;
        getState(): string;
        isStarted(): boolean;
        hasChildren(): boolean;
        getForm(): api.form.Form;
        getAuthForm(): api.form.Form;
        getMinSystemVersion(): string;
        getMaxSystemVersion(): string;
        getapplicationDependencies(): api.application.ApplicationKey[];
        getContentTypeDependencies(): api.schema.content.ContentTypeName[];
        getMetaSteps(): api.schema.mixin.MixinNames;
        getIconUrl(): string;
        static fromJson(json: api.application.json.ApplicationJson): Application;
        static fromJsonArray(jsonArray: api.application.json.ApplicationJson[]): Application[];
        equals(o: api.Equitable): boolean;
    }
    class ApplicationBuilder extends api.item.BaseItemBuilder {
        applicationKey: ApplicationKey;
        displayName: string;
        description: string;
        vendorName: string;
        vendorUrl: string;
        url: string;
        state: string;
        version: string;
        local: boolean;
        config: api.form.Form;
        authConfig: api.form.Form;
        applicationDependencies: api.application.ApplicationKey[];
        contentTypeDependencies: api.schema.content.ContentTypeName[];
        metaSteps: api.schema.mixin.MixinNames;
        minSystemVersion: string;
        maxSystemVersion: string;
        iconUrl: string;
        constructor(source?: Application);
        fromJson(json: api.application.json.ApplicationJson): ApplicationBuilder;
        build(): Application;
    }
    class ApplicationUploadMock {
        private id;
        private name;
        private uploadItem;
        constructor(uploadItem: UploadItem<Application>);
        getId(): string;
        getDisplayName(): string;
        getName(): string;
        getUploadItem(): UploadItem<Application>;
        getApplicationKey(): string;
        isLocal(): boolean;
    }
}
declare module api.application {
    class ApplicationResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourcePath;
        constructor();
        getResourcePath(): api.rest.Path;
        fromJsonToApplication(json: api.application.json.ApplicationJson): Application;
    }
}
declare module api.application {
    class ApplicationInstallResult implements api.Equitable {
        private application;
        private failure;
        setFailure(value: string): void;
        setApplication(application: Application): void;
        getApplication(): api.application.Application;
        getFailure(): string;
        equals(o: api.Equitable): boolean;
        static fromJson(json: json.ApplicationInstallResultJson): ApplicationInstallResult;
    }
}
declare module api.application {
    import ApplicationJson = api.application.json.ApplicationJson;
    class GetApplicationRequest extends ApplicationResourceRequest<ApplicationJson, Application> {
        private applicationKey;
        private skipCache;
        constructor(applicationKey: ApplicationKey, skipCache?: boolean);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Application>;
    }
}
declare module api.application {
    class ListApplicationsRequest extends ApplicationResourceRequest<ApplicationListResult, Application[]> {
        private searchQuery;
        private apiName;
        constructor(apiName?: string);
        getParams(): Object;
        setSearchQuery(query: string): ListApplicationsRequest;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Application[]>;
    }
}
declare module api.application {
    class ListApplicationKeysRequest extends ApplicationResourceRequest<string[], ApplicationKey[]> {
        private searchQuery;
        private apiName;
        constructor(apiName?: string);
        getParams(): Object;
        setSearchQuery(query: string): ListApplicationKeysRequest;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ApplicationKey[]>;
    }
}
declare module api.application {
    class ApplicationListResult {
        applications: api.application.json.ApplicationJson[];
    }
}
declare module api.application {
    class ApplicationLoader extends api.util.loader.BaseLoader<ApplicationListResult, Application> {
        protected request: ListApplicationsRequest;
        private filterObject;
        constructor(filterObject: Object, request?: ListApplicationsRequest);
        protected createRequest(): ListApplicationsRequest;
        protected getRequest(): ListApplicationsRequest;
        search(searchString: string): wemQ.Promise<Application[]>;
        load(): wemQ.Promise<Application[]>;
        private filterResults(application);
    }
}
declare module api.application {
    class SiteApplicationLoader extends ApplicationLoader {
        constructor(filterObject: Object);
    }
}
declare module api.application {
    import ApplicationUploadMock = api.application.ApplicationUploadMock;
    class ApplicationViewer extends api.ui.NamesAndIconViewer<Application> {
        constructor();
        doLayout(object: Application | ApplicationUploadMock): void;
        resolveDisplayName(object: Application): string;
        resolveSubName(object: Application | ApplicationUploadMock, relativePath?: boolean): string;
        resolveIconClass(object: Application): string;
    }
}
declare module api.application {
    class StopApplicationRequest extends ApplicationResourceRequest<void, void> {
        private applicationKeys;
        constructor(applicationKeys: ApplicationKey[]);
        getRequestPath(): api.rest.Path;
        getParams(): Object;
        sendAndParse(): wemQ.Promise<void>;
    }
}
declare module api.application {
    class StartApplicationRequest extends ApplicationResourceRequest<void, void> {
        private applicationKeys;
        constructor(applicationKeys: ApplicationKey[]);
        getRequestPath(): api.rest.Path;
        getParams(): Object;
        sendAndParse(): wemQ.Promise<void>;
    }
}
declare module api.application {
    enum ApplicationEventType {
        INSTALLED = 0,
        UNINSTALLED = 1,
        RESOLVED = 2,
        STARTING = 3,
        STARTED = 4,
        UPDATED = 5,
        STOPPING = 6,
        STOPPED = 7,
        UNRESOLVED = 8,
        PROGRESS = 9,
    }
    interface ApplicationEventJson extends api.event.EventJson {
        data: ApplicationEventDataJson;
    }
    interface ApplicationEventDataJson {
        eventType: string;
        applicationKey: string;
        applicationUrl?: string;
        progress?: number;
    }
    class ApplicationEvent extends api.event.Event {
        private applicationKey;
        private applicationUrl;
        private eventType;
        private progress;
        constructor(applicationKey: api.application.ApplicationKey, eventType: ApplicationEventType, applicationUrl?: string, progress?: number);
        getApplicationKey(): api.application.ApplicationKey;
        getEventType(): ApplicationEventType;
        getApplicationUrl(): string;
        getProgress(): number;
        isNeedToUpdateApplication(): boolean;
        static on(handler: (event: ApplicationEvent) => void): void;
        static un(handler?: (event: ApplicationEvent) => void): void;
        static fromJson(applicationEventJson: ApplicationEventJson): ApplicationEvent;
    }
}
declare module api.application {
    class ApplicationCache extends api.cache.Cache<Application, ApplicationKey> {
        private static instance;
        constructor();
        copy(object: Application): Application;
        getKeyFromObject(object: Application): ApplicationKey;
        getKeyAsString(key: ApplicationKey): string;
        static get(): ApplicationCache;
    }
}
declare module api.application {
    class ApplicationBasedName implements api.Equitable {
        static SEPARATOR: string;
        private refString;
        private applicationKey;
        private localName;
        constructor(applicationKey: ApplicationKey, localName: string);
        getLocalName(): string;
        getApplicationKey(): ApplicationKey;
        toString(): string;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.application {
    class ApplicationCaches<CACHE extends api.cache.Cache<any, any>> {
        private cacheByApplicationKey;
        put(key: ApplicationKey, cache: CACHE): void;
        getByKey(key: ApplicationKey): CACHE;
        removeByKey(key: ApplicationKey): void;
    }
}
declare module api.application {
    class ApplicationBasedCache<CACHE extends api.cache.Cache<any, any>, T, TKEY> {
        private applicationCaches;
        constructor();
        loadByApplication(applicationKey: ApplicationKey): void;
        getByApplication(applicationKey: ApplicationKey): T[];
        getByKey(key: TKEY, applicationKey: ApplicationKey): T;
        put(object: T, applicationKey?: ApplicationKey): void;
        createApplicationCache(): CACHE;
        private deleteByApplicationKey(applicationKey);
    }
}
declare module api.application {
    class ApplicationUploaderEl extends api.ui.uploader.UploaderEl<Application> {
        private failure;
        constructor(config: api.ui.uploader.UploaderElConfig);
        createModel(serverResponse: api.application.json.ApplicationInstallResultJson): Application;
        getFailure(): string;
        getModelValue(item: Application): string;
        createResultItem(value: string): api.dom.Element;
        protected getErrorMessage(fileString: string): string;
    }
}
declare module api.application {
    import UploadItem = api.ui.uploader.UploadItem;
    class ApplicationUploadStartedEvent extends api.event.Event {
        private uploadItems;
        constructor(items: UploadItem<Application>[]);
        getUploadItems(): UploadItem<Application>[];
        static on(handler: (event: ApplicationUploadStartedEvent) => void): void;
        static un(handler?: (event: ApplicationUploadStartedEvent) => void): void;
    }
}
declare module api.application {
    import ApplicationInstallResultJson = api.application.json.ApplicationInstallResultJson;
    class InstallUrlApplicationRequest extends ApplicationResourceRequest<ApplicationInstallResultJson, ApplicationInstallResult> {
        private applicationUrl;
        constructor(applicationUrl: string);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ApplicationInstallResult>;
    }
}
declare module api.application {
    import ApplicationKey = api.application.ApplicationKey;
    class MarketApplication {
        private appKey;
        private displayName;
        private name;
        private description;
        private iconUrl;
        private url;
        private latestVersion;
        private versions;
        private status;
        private progress;
        constructor(builder: MarketApplicationBuilder);
        static fromJson(appKey: string, json: api.application.json.MarketApplicationJson): MarketApplication;
        static fromJsonArray(appsObj: Object): MarketApplication[];
        isEmpty(): boolean;
        getDisplayName(): string;
        getName(): string;
        getDescription(): string;
        getIconUrl(): string;
        getUrl(): string;
        getLatestVersion(): string;
        getLatestVersionDownloadUrl(): string;
        getVersions(): Object;
        setStatus(status: MarketAppStatus): void;
        getStatus(): MarketAppStatus;
        setProgress(progress: number): void;
        getProgress(): number;
        getAppKey(): ApplicationKey;
    }
    enum MarketAppStatus {
        NOT_INSTALLED = 0,
        INSTALLED = 1,
        INSTALLING = 2,
        OLDER_VERSION_INSTALLED = 3,
        UNKNOWN = 4,
    }
    class MarketAppStatusFormatter {
        static statusInstallCssClass: string;
        static statusInstalledCssClass: string;
        static statusInstallingCssClass: string;
        static statusUpdateCssClass: string;
        static formatStatus(appStatus: MarketAppStatus, progress?: number): string;
        static getStatusCssClass(appStatus: MarketAppStatus): string;
        static formatPerformedAction(appStatus: MarketAppStatus): string;
    }
    class MarketApplicationBuilder {
        displayName: string;
        name: string;
        description: string;
        iconUrl: string;
        url: string;
        latestVersion: string;
        versions: Object;
        status: string;
        appKey: ApplicationKey;
        fromJson(appKey: string, json: api.application.json.MarketApplicationJson): MarketApplicationBuilder;
        setLatestVersion(latestVersion: string): MarketApplicationBuilder;
        build(): MarketApplication;
    }
}
declare module api.application {
    class MarketApplicationsFetcher {
        static fetchChildren(version: string, installedApplications: Application[], from?: number, size?: number): wemQ.Promise<MarketApplicationResponse>;
        static installedAppCanBeUpdated(marketApp: MarketApplication, installedApp: Application): boolean;
        private static compareVersionNumbers(v1, v2);
    }
}
declare module api.application {
    class MarketApplicationResponse {
        private applications;
        private metadata;
        constructor(contents: MarketApplication[], metadata: MarketApplicationMetadata);
        getApplications(): MarketApplication[];
        getMetadata(): MarketApplicationMetadata;
        setApplications(contents: MarketApplication[]): MarketApplicationResponse;
        setMetadata(metadata: MarketApplicationMetadata): MarketApplicationResponse;
    }
}
declare module api.application {
    class MarketApplicationMetadata implements api.Equitable {
        private hits;
        private totalHits;
        constructor(hits: number, totalHits: number);
        getHits(): number;
        getTotalHits(): number;
        setHits(hits: number): void;
        setTotalHits(totalHits: number): void;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.application {
    import MarketApplicationsListJson = api.application.json.MarketApplicationsListJson;
    class ListMarketApplicationsRequest extends ApplicationResourceRequest<MarketApplicationsListJson, MarketApplicationResponse> {
        private version;
        private start;
        private count;
        private ids;
        constructor();
        setIds(ids: string[]): ListMarketApplicationsRequest;
        setVersion(version: string): ListMarketApplicationsRequest;
        setStart(start: number): ListMarketApplicationsRequest;
        setCount(count: number): ListMarketApplicationsRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<MarketApplicationResponse>;
    }
}
declare module api.application {
    class UninstallApplicationRequest extends ApplicationResourceRequest<void, void> {
        private applicationKeys;
        constructor(applicationKeys: ApplicationKey[]);
        getRequestPath(): api.rest.Path;
        getParams(): Object;
        sendAndParse(): wemQ.Promise<void>;
    }
}
declare module api.application {
    class ListSiteApplicationsRequest extends ListApplicationsRequest {
        constructor();
    }
}
declare module api.application {
    class ListAuthApplicationsRequest extends ApplicationResourceRequest<ApplicationListResult, Application[]> {
        constructor();
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Application[]>;
    }
}
declare module api.application {
    import ApplicationJson = api.application.json.ApplicationJson;
    class AuthApplicationRequest extends ApplicationResourceRequest<ApplicationJson, Application> {
        private applicationKey;
        constructor(applicationKey: ApplicationKey);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Application>;
    }
}
declare module api.application.json {
    interface ApplicationJson extends api.item.ItemJson {
        key: string;
        version: string;
        displayName: string;
        description: string;
        info: string;
        url: string;
        vendorName: string;
        vendorUrl: string;
        state: string;
        config: api.form.json.FormJson;
        authConfig: api.form.json.FormJson;
        applicationDependencies: string[];
        contentTypeDependencies: string[];
        metaSteps: string[];
        minSystemVersion: string;
        maxSystemVersion: string;
        local: boolean;
        iconUrl: string;
    }
}
declare module api.application.json {
    interface MarketApplicationJson {
        displayName: string;
        name: string;
        description: string;
        iconUrl: string;
        url: string;
        latestVersion: string;
        versions: Object;
    }
}
declare module api.application.json {
    interface MarketApplicationsListJson {
        total: number;
        hits: Object;
    }
}
declare module api.application.json {
    interface ApplicationInstallResultJson {
        applicationInstalledJson: ApplicationJson;
        failure: string;
    }
}
declare module api.macro.resource {
    interface MacrosJson {
        macros: MacroJson[];
    }
    interface MacroJson {
        key: string;
        name: string;
        displayName: string;
        description: string;
        form: api.form.json.FormJson;
        iconUrl: string;
    }
}
declare module api.macro.resource {
    interface MacroPreviewStringJson {
        macro: string;
    }
    interface MacroPreviewJson extends MacroPreviewStringJson {
        html: string;
        pageContributions: PageContributionsJson;
    }
    interface PageContributionsJson {
        bodyBegin: string[];
        bodyEnd: string[];
        headBegin: string[];
        headEnd: string[];
    }
}
declare module api.macro.resource {
    class MacroResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourcePath;
        constructor();
        getResourcePath(): api.rest.Path;
    }
}
declare module api.macro.resource {
    class PreviewRequest<JSON_TYPE, PARSED_TYPE> extends MacroResourceRequest<JSON_TYPE, PARSED_TYPE> {
        protected data: api.data.PropertyTree;
        protected macroKey: api.macro.MacroKey;
        constructor(data: api.data.PropertyTree, macroKey: api.macro.MacroKey);
        getParams(): Object;
    }
}
declare module api.macro.resource {
    import ApplicationKey = api.application.ApplicationKey;
    class GetMacrosRequest extends MacroResourceRequest<MacrosJson, MacroDescriptor[]> {
        private applicationKeys;
        constructor();
        setApplicationKeys(applicationKeys: ApplicationKey[]): void;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<MacroDescriptor[]>;
        toMacroDescriptors(macrosJson: MacrosJson): MacroDescriptor[];
    }
}
declare module api.macro.resource {
    class GetPreviewStringRequest extends PreviewRequest<MacroPreviewStringJson, string> {
        constructor(data: api.data.PropertyTree, macroKey: api.macro.MacroKey);
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<string>;
    }
}
declare module api.macro.resource {
    class GetPreviewRequest extends PreviewRequest<MacroPreviewJson, MacroPreview> {
        protected path: api.content.ContentPath;
        constructor(data: api.data.PropertyTree, macroKey: api.macro.MacroKey, path: api.content.ContentPath);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<MacroPreview>;
    }
}
declare module api.macro.resource {
    import ApplicationKey = api.application.ApplicationKey;
    class MacrosLoader extends api.util.loader.BaseLoader<MacrosJson, MacroDescriptor> {
        protected request: GetMacrosRequest;
        private hasRelevantData;
        constructor();
        setApplicationKeys(applicationKeys: ApplicationKey[]): void;
        protected createRequest(): GetMacrosRequest;
        protected getRequest(): GetMacrosRequest;
        private invalidate();
        load(): wemQ.Promise<MacroDescriptor[]>;
        search(searchString: string): wemQ.Promise<MacroDescriptor[]>;
        filterFn(macro: MacroDescriptor): boolean;
    }
}
declare module api.macro {
    class MacroKey implements api.Equitable {
        private static SEPARATOR;
        private applicationKey;
        private name;
        private refString;
        constructor(applicationKey: api.application.ApplicationKey, name: string);
        static fromString(str: string): MacroKey;
        getApplicationKey(): api.application.ApplicationKey;
        getName(): string;
        getRefString(): string;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.macro {
    class MacroDescriptor implements api.Equitable {
        private macroKey;
        private displayName;
        private description;
        private form;
        private iconUrl;
        constructor(builder: MacroDescriptorBuilder);
        getKey(): MacroKey;
        getName(): string;
        getDisplayName(): string;
        getDescription(): string;
        getForm(): api.form.Form;
        getIconUrl(): string;
        static create(): MacroDescriptorBuilder;
        equals(o: api.Equitable): boolean;
    }
    class MacroDescriptorBuilder {
        macroKey: MacroKey;
        displayName: string;
        description: string;
        form: api.form.Form;
        iconUrl: string;
        fromSource(source: MacroDescriptor): MacroDescriptorBuilder;
        fromJson(json: api.macro.resource.MacroJson): this;
        setKey(key: MacroKey): MacroDescriptorBuilder;
        setDisplayName(displayName: string): MacroDescriptorBuilder;
        setDescription(description: string): MacroDescriptorBuilder;
        setForm(form: api.form.Form): MacroDescriptorBuilder;
        setIconUrl(iconUrl: string): MacroDescriptorBuilder;
        build(): MacroDescriptor;
    }
}
declare module api.macro {
    class PageContributions implements api.Equitable {
        private bodyBegin;
        private bodyEnd;
        private headBegin;
        private headEnd;
        constructor(builder: PageContributionsBuilder);
        getBodyBegin(): string[];
        getBodyEnd(): string[];
        getHeadBegin(): string[];
        getHeadEnd(): string[];
        hasAtLeastOneScript(): boolean;
        equals(o: api.Equitable): boolean;
        static create(): PageContributionsBuilder;
    }
    class PageContributionsBuilder {
        bodyBegin: string[];
        bodyEnd: string[];
        headBegin: string[];
        headEnd: string[];
        fromJson(json: api.macro.resource.PageContributionsJson): this;
        setBodyBegin(value: string[]): PageContributionsBuilder;
        setBodyEnd(value: string[]): PageContributionsBuilder;
        setHeadBegin(value: string[]): PageContributionsBuilder;
        setHeadEnd(value: string[]): PageContributionsBuilder;
        build(): PageContributions;
    }
}
declare module api.macro {
    class MacroPreview implements api.Equitable {
        private html;
        private macroString;
        private pageContributions;
        constructor(builder: MacroPreviewBuilder);
        getHtml(): string;
        getMacroString(): string;
        getPageContributions(): PageContributions;
        static create(): MacroPreviewBuilder;
        equals(o: api.Equitable): boolean;
    }
    class MacroPreviewBuilder {
        html: string;
        macroString: string;
        pageContributions: PageContributions;
        fromJson(json: api.macro.resource.MacroPreviewJson): this;
        setHtml(html: string): MacroPreviewBuilder;
        setMacroString(macroString: string): MacroPreviewBuilder;
        setPageContributions(pageContributions: PageContributions): MacroPreviewBuilder;
        build(): MacroPreview;
    }
}
declare module api.macro {
    class MacroViewer extends api.ui.NamesAndIconViewer<MacroDescriptor> {
        constructor();
        resolveDisplayName(object: MacroDescriptor): string;
        resolveSubName(object: MacroDescriptor, relativePath?: boolean): string;
        resolveIconUrl(object: MacroDescriptor): string;
    }
}
declare module api.macro {
    import SelectedOption = api.ui.selector.combobox.SelectedOption;
    import Option = api.ui.selector.Option;
    import RichComboBox = api.ui.selector.combobox.RichComboBox;
    import MacrosLoader = api.macro.resource.MacrosLoader;
    class MacroComboBox extends RichComboBox<MacroDescriptor> {
        constructor(builder: MacroComboBoxBuilder);
        getLoader(): MacrosLoader;
        createOption(val: MacroDescriptor): Option<MacroDescriptor>;
        static create(): MacroComboBoxBuilder;
    }
    class MacroSelectedOptionsView extends api.ui.selector.combobox.BaseSelectedOptionsView<MacroDescriptor> {
        createSelectedOption(option: api.ui.selector.Option<MacroDescriptor>): SelectedOption<MacroDescriptor>;
    }
    class MacroSelectedOptionView extends api.ui.selector.combobox.RichSelectedOptionView<MacroDescriptor> {
        constructor(option: api.ui.selector.Option<MacroDescriptor>);
        resolveIconUrl(macroDescriptor: MacroDescriptor): string;
        resolveTitle(macroDescriptor: MacroDescriptor): string;
        resolveSubTitle(macroDescriptor: MacroDescriptor): string;
    }
    class MacroComboBoxBuilder {
        maximumOccurrences: number;
        loader: MacrosLoader;
        value: string;
        setMaximumOccurrences(maximumOccurrences: number): MacroComboBoxBuilder;
        setLoader(loader: MacrosLoader): MacroComboBoxBuilder;
        setValue(value: string): MacroComboBoxBuilder;
        build(): MacroComboBox;
    }
}
declare module api.schema {
    interface SchemaJson extends api.item.ItemJson {
        displayName: string;
        description: string;
        name: string;
        iconUrl: string;
    }
}
declare module api.schema {
    class Schema extends api.item.BaseItem {
        private name;
        private displayName;
        private description;
        private iconUrl;
        constructor(builder: SchemaBuilder);
        getName(): string;
        getDisplayName(): string;
        getDescription(): string;
        getIconUrl(): string;
        equals(o: api.Equitable): boolean;
        static fromJson(json: api.schema.SchemaJson): Schema;
    }
    class SchemaBuilder extends api.item.BaseItemBuilder {
        name: string;
        displayName: string;
        description: string;
        iconUrl: string;
        constructor(source?: Schema);
        fromSchemaJson(json: api.schema.SchemaJson): SchemaBuilder;
        setName(value: string): SchemaBuilder;
        build(): Schema;
    }
}
declare module api.schema {
    class SchemaIconUrlResolver extends api.icon.IconUrlResolver {
        resolve(schema: Schema): string;
        static getResourcePath(): api.rest.Path;
    }
}
declare module api.schema.mixin {
    class MixinName extends api.application.ApplicationBasedName {
        constructor(name: string);
        equals(o: api.Equitable): boolean;
    }
}
declare module api.schema.mixin {
    class MixinNames implements api.Equitable {
        private array;
        constructor(array: MixinName[]);
        forEach(callback: (mixinName: MixinName, index?: number) => void): void;
        contains(mixinName: MixinName): boolean;
        filter(callbackfn: (value: MixinName, index?: number) => boolean): MixinNames;
        map<U>(callbackfn: (value: MixinName, index?: number) => U): U[];
        equals(o: api.Equitable): boolean;
        static create(): MixinNamesBuilder;
    }
    class MixinNamesBuilder {
        array: MixinName[];
        fromStrings(values: string[]): MixinNamesBuilder;
        fromMixins(mixins: Mixin[]): MixinNamesBuilder;
        addMixinName(value: MixinName): MixinNamesBuilder;
        build(): MixinNames;
    }
}
declare module api.schema.mixin {
    class Mixin extends api.schema.Schema implements api.Equitable {
        private schemaKey;
        private formItems;
        constructor(builder: MixinBuilder);
        getMixinName(): MixinName;
        getFormItems(): api.form.FormItem[];
        getSchemaKey(): string;
        equals(o: api.Equitable): boolean;
        toForm(): api.form.Form;
        static fromJson(json: api.schema.mixin.MixinJson): Mixin;
    }
    class MixinBuilder extends api.schema.SchemaBuilder {
        schemaKey: string;
        formItems: api.form.FormItem[];
        constructor(source?: Mixin);
        fromMixinJson(mixinJson: api.schema.mixin.MixinJson): MixinBuilder;
        build(): Mixin;
    }
}
declare module api.schema.mixin {
    class MixinResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourceUrl;
        constructor();
        getResourcePath(): api.rest.Path;
        fromJsonToMixin(json: api.schema.mixin.MixinJson): Mixin;
    }
}
declare module api.schema.mixin {
    class GetMixinByQualifiedNameRequest extends MixinResourceRequest<api.schema.mixin.MixinJson, Mixin> {
        private name;
        constructor(name: MixinName);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Mixin>;
    }
}
declare module api.schema.mixin {
    import ApplicationKey = api.application.ApplicationKey;
    class GetMixinsByApplicationRequest extends MixinResourceRequest<MixinListJson, Mixin[]> {
        private applicationKey;
        constructor(applicationKey: ApplicationKey);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Mixin[]>;
    }
}
declare module api.schema.mixin {
    interface MixinJson extends api.schema.SchemaJson {
        items: api.form.json.FormItemJson[];
    }
}
declare module api.schema.mixin {
    interface MixinListJson {
        mixins: MixinJson[];
    }
}
declare module api.schema.mixin {
    interface InlineMixinJson extends api.form.json.FormItemJson {
        type: string;
        reference: string;
    }
}
declare module api.schema.content {
    class ContentTypeName extends api.application.ApplicationBasedName {
        static UNSTRUCTURED: ContentTypeName;
        static FOLDER: ContentTypeName;
        static SHORTCUT: ContentTypeName;
        static MEDIA: ContentTypeName;
        static MEDIA_TEXT: ContentTypeName;
        static MEDIA_DATA: ContentTypeName;
        static MEDIA_AUDIO: ContentTypeName;
        static MEDIA_VIDEO: ContentTypeName;
        static MEDIA_IMAGE: ContentTypeName;
        static MEDIA_VECTOR: ContentTypeName;
        static MEDIA_ARCHIVE: ContentTypeName;
        static MEDIA_DOCUMENT: ContentTypeName;
        static MEDIA_SPREADSHEET: ContentTypeName;
        static MEDIA_PRESENTATION: ContentTypeName;
        static MEDIA_CODE: ContentTypeName;
        static MEDIA_EXECUTABLE: ContentTypeName;
        static MEDIA_UNKNOWN: ContentTypeName;
        static SITE: ContentTypeName;
        static PAGE_TEMPLATE: ContentTypeName;
        static TEMPLATE_FOLDER: ContentTypeName;
        static FRAGMENT: ContentTypeName;
        static IMAGE: ContentTypeName;
        constructor(name: string);
        static from(applicationKey: api.application.ApplicationKey, localName: string): ContentTypeName;
        isFolder(): boolean;
        isSite(): boolean;
        isPageTemplate(): boolean;
        isTemplateFolder(): boolean;
        isFragment(): boolean;
        isImage(): boolean;
        isMedia(): boolean;
        isVectorMedia(): boolean;
        isShortcut(): boolean;
        static getMediaTypes(): ContentTypeName[];
        isDescendantOfMedia(): boolean;
    }
}
declare module api.schema.content {
    import MixinNames = api.schema.mixin.MixinNames;
    class ContentTypeSummary extends api.schema.Schema implements api.Equitable {
        private allowChildContent;
        private abstract;
        private final;
        private superType;
        private contentDisplayNameScript;
        private modifier;
        private owner;
        private metadata;
        constructor(builder: ContentTypeSummaryBuilder);
        getContentTypeName(): api.schema.content.ContentTypeName;
        isSite(): boolean;
        isPageTemplate(): boolean;
        isImage(): boolean;
        isShortcut(): boolean;
        isFinal(): boolean;
        isAbstract(): boolean;
        isAllowChildContent(): boolean;
        getSuperType(): api.schema.content.ContentTypeName;
        hasContentDisplayNameScript(): boolean;
        getContentDisplayNameScript(): string;
        getOwner(): string;
        getModifier(): string;
        getMetadata(): MixinNames;
        equals(o: api.Equitable): boolean;
        static fromJsonArray(jsonArray: api.schema.content.ContentTypeSummaryJson[]): ContentTypeSummary[];
        static fromJson(json: api.schema.content.ContentTypeSummaryJson): ContentTypeSummary;
    }
    class ContentTypeSummaryBuilder extends api.schema.SchemaBuilder {
        allowChildContent: boolean;
        abstract: boolean;
        final: boolean;
        superType: api.schema.content.ContentTypeName;
        contentDisplayNameScript: string;
        modifier: string;
        owner: string;
        metadata: MixinNames;
        constructor(source?: ContentTypeSummary);
        fromContentTypeSummaryJson(json: api.schema.content.ContentTypeSummaryJson): ContentTypeSummaryBuilder;
        build(): ContentTypeSummary;
    }
}
declare module api.schema.content {
    class ContentType extends ContentTypeSummary implements api.Equitable {
        private form;
        constructor(builder: ContentTypeBuilder);
        getForm(): api.form.Form;
        equals(o: api.Equitable): boolean;
        static fromJson(json: api.schema.content.ContentTypeJson): ContentType;
    }
    class ContentTypeBuilder extends ContentTypeSummaryBuilder {
        form: api.form.Form;
        constructor(source?: ContentType);
        fromContentTypeJson(json: api.schema.content.ContentTypeJson): ContentTypeBuilder;
        setForm(value: api.form.Form): ContentTypeSummaryBuilder;
        build(): ContentType;
    }
}
declare module api.schema.content {
    class ContentTypeIconUrlResolver extends api.schema.SchemaIconUrlResolver {
        static default(): string;
    }
}
declare module api.schema.content {
    class ContentTypeSummaryViewer extends api.ui.NamesAndIconViewer<ContentTypeSummary> {
        private contentTypeIconUrlResolver;
        constructor();
        resolveDisplayName(object: ContentTypeSummary): string;
        resolveSubName(object: ContentTypeSummary, relativePath?: boolean): string;
        resolveIconUrl(object: ContentTypeSummary): string;
    }
}
declare module api.schema.content {
    import BaseLoader = api.util.loader.BaseLoader;
    import ContentTypeSummaryListJson = api.schema.content.ContentTypeSummaryListJson;
    import SelectedOption = api.ui.selector.combobox.SelectedOption;
    import RichComboBox = api.ui.selector.combobox.RichComboBox;
    import BaseSelectedOptionsView = api.ui.selector.combobox.BaseSelectedOptionsView;
    import RichSelectedOptionView = api.ui.selector.combobox.RichSelectedOptionView;
    class ContentTypeComboBox extends RichComboBox<ContentTypeSummary> {
        constructor(maximumOccurrences: number, loader: BaseLoader<ContentTypeSummaryListJson, ContentTypeSummary>);
    }
    class ContentTypeSelectedOptionsView extends BaseSelectedOptionsView<ContentTypeSummary> {
        createSelectedOption(option: api.ui.selector.Option<ContentTypeSummary>): SelectedOption<ContentTypeSummary>;
    }
    class ContentTypeSelectedOptionView extends RichSelectedOptionView<ContentTypeSummary> {
        constructor(option: api.ui.selector.Option<ContentTypeSummary>);
        resolveIconUrl(content: ContentTypeSummary): string;
        resolveTitle(content: ContentTypeSummary): string;
        resolveSubTitle(content: ContentTypeSummary): string;
        protected isEditButtonNeeded(): boolean;
    }
}
declare module api.schema.content {
    import BaseLoader = api.util.loader.BaseLoader;
    import ContentTypeSummaryListJson = api.schema.content.ContentTypeSummaryListJson;
    class ContentTypeSummaryLoader extends BaseLoader<ContentTypeSummaryListJson, ContentTypeSummary> {
        constructor();
        filterFn(contentType: ContentTypeSummary): boolean;
    }
}
declare module api.schema.content {
    class PageTemplateContentTypeLoader extends api.util.loader.BaseLoader<ContentTypeSummaryListJson, ContentTypeSummary> {
        private contentId;
        constructor(contentId: api.content.ContentId);
        filterFn(contentType: ContentTypeSummary): boolean;
        sendRequest(): wemQ.Promise<ContentTypeSummary[]>;
    }
}
declare module api.schema.content {
    enum ContentStateEnum {
        PENDING_DELETE = 0,
        DEFAULT = 1,
    }
    class ContentState {
        private state;
        constructor(state?: ContentStateEnum);
        getState(): ContentStateEnum;
        getStateAsString(): string;
        static fromString(value: string): ContentState;
        isDefault(): boolean;
        isPendingDelete(): boolean;
    }
}
declare module api.content {
    import ContentTypeSummary = api.schema.content.ContentTypeSummary;
    class ContentTypeSummaryByDisplayNameComparator implements api.Comparator<ContentTypeSummary> {
        compare(item1: ContentTypeSummary, item2: ContentTypeSummary): number;
    }
}
declare module api.schema.content {
    class ContentTypeResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourceUrl;
        constructor();
        getResourcePath(): api.rest.Path;
        fromJsonToContentType(json: api.schema.content.ContentTypeJson): ContentType;
        fromJsonToContentTypeSummary(json: api.schema.content.ContentTypeSummaryJson): ContentTypeSummary;
    }
}
declare module api.schema.content {
    class GetAllContentTypesRequest extends ContentTypeResourceRequest<ContentTypeSummaryListJson, ContentTypeSummary[]> {
        private inlineMixinsToFormItems;
        constructor();
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentTypeSummary[]>;
    }
}
declare module api.schema.content {
    class GetContentTypeByNameRequest extends ContentTypeResourceRequest<ContentTypeJson, ContentType> {
        private name;
        private inlineMixinsToFormItems;
        constructor(name: ContentTypeName);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentType>;
    }
}
declare module api.schema.content {
    import ApplicationKey = api.application.ApplicationKey;
    class GetContentTypesByApplicationRequest extends ContentTypeResourceRequest<ContentTypeSummaryListJson, ContentTypeSummary[]> {
        private applicationKey;
        constructor(applicationKey: ApplicationKey);
        getRequestPath(): api.rest.Path;
        getParams(): Object;
        sendAndParse(): wemQ.Promise<ContentTypeSummary[]>;
    }
}
declare module api.schema.content {
    class ContentTypeCache extends api.cache.Cache<ContentType, ContentTypeName> {
        private static instance;
        constructor();
        copy(object: ContentType): ContentType;
        getKeyFromObject(object: ContentType): ContentTypeName;
        getKeyAsString(key: ContentTypeName): string;
        private getCachedByApplicationKey(applicationKey);
        static get(): ContentTypeCache;
    }
}
declare module api.schema.content {
    interface ContentTypeSummaryJson extends api.schema.SchemaJson {
        abstract: boolean;
        allowChildContent: boolean;
        contentDisplayNameScript: string;
        final: boolean;
        superType: string;
        owner: string;
        modifier: string;
        metadata: string[];
    }
}
declare module api.schema.content {
    interface ContentTypeSummaryListJson extends api.schema.SchemaJson {
        total: number;
        totalHits: number;
        hits: number;
        contentTypes: ContentTypeSummaryJson[];
    }
}
declare module api.schema.content {
    interface ContentTypeJson extends ContentTypeSummaryJson {
        form: api.form.json.FormJson;
    }
}
declare module api.schema.content.inputtype {
    import ContentInputTypeViewContext = api.content.form.inputtype.ContentInputTypeViewContext;
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import Input = api.form.Input;
    class ContentTypeFilter extends api.form.inputtype.support.BaseInputTypeManagingAdd<string> {
        private combobox;
        private context;
        private onContentTypesLoadedHandler;
        constructor(context: ContentInputTypeViewContext);
        getValueType(): ValueType;
        newInitialValue(): Value;
        private createLoader();
        private createPageTemplateLoader();
        private createComboBox();
        private onContentTypesLoaded();
        private onContentTypeSelected(selectedOption);
        private onContentTypeDeselected(option);
        layout(input: Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        update(propertyArray: api.data.PropertyArray, unchangedOnly: boolean): Q.Promise<void>;
        reset(): void;
        private getValues();
        protected getNumberOfValids(): number;
        giveFocus(): boolean;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.schema.relationshiptype {
    class RelationshipTypeName extends api.application.ApplicationBasedName {
        static REFERENCE: RelationshipTypeName;
        constructor(name: string);
    }
}
declare module api.schema.relationshiptype {
    class RelationshipType extends api.schema.Schema implements api.Equitable {
        private fromSemantic;
        private toSemantic;
        private allowedFromTypes;
        private allowedToTypes;
        constructor(builder: RelationshipTypeBuilder);
        getRelationshiptypeName(): RelationshipTypeName;
        getFromSemantic(): string;
        getToSemantic(): string;
        getAllowedFromTypes(): string[];
        getAllowedToTypes(): string[];
        equals(o: api.Equitable): boolean;
        static fromJson(json: api.schema.relationshiptype.RelationshipTypeJson): RelationshipType;
    }
    class RelationshipTypeBuilder extends api.schema.SchemaBuilder {
        fromSemantic: string;
        toSemantic: string;
        allowedFromTypes: string[];
        allowedToTypes: string[];
        constructor(source?: RelationshipType);
        fromRelationshipTypeJson(relationshipTypeJson: api.schema.relationshiptype.RelationshipTypeJson): RelationshipTypeBuilder;
        build(): RelationshipType;
    }
}
declare module api.schema.relationshiptype {
    class RelationshipTypeResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourceUrl;
        constructor();
        getResourcePath(): api.rest.Path;
        fromJsonToReleationshipType(json: api.schema.relationshiptype.RelationshipTypeJson): RelationshipType;
    }
}
declare module api.schema.relationshiptype {
    class GetRelationshipTypeByNameRequest extends RelationshipTypeResourceRequest<RelationshipTypeJson, RelationshipType> {
        private name;
        constructor(name: RelationshipTypeName);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<RelationshipType>;
    }
}
declare module api.schema.relationshiptype {
    import ApplicationKey = api.application.ApplicationKey;
    import RelationshipTypeListJson = api.schema.relationshiptype.RelationshipTypeListJson;
    class GetRelationshipTypesByApplicationRequest extends RelationshipTypeResourceRequest<RelationshipTypeListJson, RelationshipType[]> {
        private applicationKey;
        constructor(applicationKey: ApplicationKey);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<RelationshipType[]>;
    }
}
declare module api.schema.relationshiptype {
    interface RelationshipTypeJson extends api.schema.SchemaJson {
        fromSemantic: string;
        toSemantic: string;
        allowedFromTypes: string[];
        allowedToTypes: string[];
    }
}
declare module api.schema.relationshiptype {
    interface RelationshipTypeListJson {
        total: number;
        relationshipTypes: RelationshipTypeJson[];
    }
}
declare module api.schema.relationshiptype {
    class RelationshipTypeCache extends api.cache.Cache<RelationshipType, RelationshipTypeName> {
        private static instance;
        constructor();
        copy(object: RelationshipType): RelationshipType;
        getKeyFromObject(object: RelationshipType): RelationshipTypeName;
        getKeyAsString(key: RelationshipTypeName): string;
        private getCachedByApplicationKey(applicationKey);
        static get(): RelationshipTypeCache;
    }
}
declare module api.thumb {
    interface ThumbnailJson {
        binaryReference: string;
        mimeType: string;
        size: number;
    }
}
declare module api.thumb {
    class Thumbnail implements api.Equitable {
        private binaryReference;
        private mimeType;
        private size;
        constructor(builder: ThumbnailBuilder);
        getBinaryReference(): api.util.BinaryReference;
        getMimeType(): string;
        getSize(): number;
        toJson(): ThumbnailJson;
        equals(o: api.Equitable): boolean;
        static create(): ThumbnailBuilder;
    }
    class ThumbnailBuilder {
        binaryReference: api.util.BinaryReference;
        mimeType: string;
        size: number;
        fromJson(json: ThumbnailJson): ThumbnailBuilder;
        setBinaryReference(value: api.util.BinaryReference): ThumbnailBuilder;
        setMimeType(value: string): ThumbnailBuilder;
        setSize(value: number): ThumbnailBuilder;
        build(): Thumbnail;
    }
}
declare module api.content.json {
    interface ContentIdBaseItemJson {
        id: string;
    }
}
declare module api.content.json {
    interface ContentSummaryJson extends ContentIdBaseItemJson, api.item.ItemJson {
        name: string;
        displayName: string;
        path: string;
        isRoot: boolean;
        hasChildren: boolean;
        type: string;
        iconUrl: string;
        thumbnail: api.thumb.ThumbnailJson;
        modifier: string;
        owner: string;
        isPage: boolean;
        isValid: boolean;
        requireValid: boolean;
        childOrder: ChildOrderJson;
        publish: ContentPublishTimeRangeJson;
        language: string;
        contentState: string;
    }
}
declare module api.content.json {
    interface ContentJson extends ContentSummaryJson {
        data: api.data.PropertyArrayJson[];
        attachments: api.content.attachment.AttachmentJson[];
        meta: api.content.json.ExtraDataJson[];
        page: api.content.page.PageJson;
        permissions: api.security.acl.AccessControlEntryJson[];
        inheritPermissions: boolean;
    }
}
declare module api.content.json {
    interface PermissionsJson {
        permissions: api.security.acl.AccessControlEntryJson[];
    }
}
declare module api.content.json {
    interface ContentPermissionsJson extends PermissionsJson {
        contentId: string;
    }
}
declare module api.content.json {
    interface ExtraDataJson {
        name: string;
        data: api.data.PropertyArrayJson[];
    }
}
declare module api.content.json {
    interface ContentPublishItemJson {
        id: string;
        path: string;
        iconUrl: string;
        displayName: string;
        compareStatus: string;
        name: string;
        type: string;
        valid: boolean;
    }
}
declare module api.content.json {
    interface ContentQueryResultJson<T extends ContentIdBaseItemJson> {
        aggregations: api.aggregation.AggregationTypeWrapperJson[];
        contents: T[];
        metadata: api.content.ContentMetadata;
    }
}
declare module api.content.json {
    interface CompareContentResultJson {
        compareStatus: string;
        publishStatus: string;
        id: string;
    }
}
declare module api.content.json {
    interface CompareContentResultsJson {
        compareContentResults: CompareContentResultJson[];
    }
}
declare module api.content.json {
    interface ContentVersionJson {
        modifier: string;
        modifierDisplayName: string;
        displayName: string;
        modified: string;
        comment: string;
        id: string;
    }
}
declare module api.content.json {
    interface GetContentVersionsResultsJson {
        from: number;
        size: number;
        hits: number;
        totalHits: number;
        contentVersions: ContentVersionJson[];
    }
}
declare module api.content.json {
    interface GetActiveContentVersionsResultsJson {
        from: number;
        size: number;
        hits: number;
        totalHits: number;
        activeContentVersions: ActiveContentVersionJson[];
    }
}
declare module api.content.json {
    interface ActiveContentVersionJson {
        branch: string;
        contentVersion: ContentVersionJson;
    }
}
declare module api.content.json {
    interface ChildOrderJson {
        orderExpressions: OrderExprWrapperJson[];
    }
}
declare module api.content.json {
    interface SetChildOrderJson extends SetOrderUpdateJson {
        childOrder: ChildOrderJson;
    }
}
declare module api.content.json {
    interface ReorderChildContentJson {
        contentId: string;
        moveBefore: string;
    }
}
declare module api.content.json {
    interface ReorderChildContentsJson extends SetOrderUpdateJson {
        manualOrder: boolean;
        childOrder: ChildOrderJson;
        reorderChildren: ReorderChildContentJson[];
    }
}
declare module api.content.json {
    interface OrderExprJson {
        direction: string;
        function?: string;
        fieldName?: string;
    }
}
declare module api.content.json {
    interface OrderExprWrapperJson {
        FieldOrderExpr?: OrderExprJson;
        DynamicOrderExpr?: OrderExprJson;
    }
}
declare module api.content.json {
    interface SetOrderUpdateJson {
        contentId: string;
        silent: boolean;
    }
}
declare module api.content.json {
    interface SetChildOrderAndReorderJson extends SetOrderUpdateJson, SetOrderUpdateJson {
    }
}
declare module api.content.json {
    interface ResolvePublishContentResultJson {
        dependentContents: ContentIdBaseItemJson[];
        requestedContents: ContentIdBaseItemJson[];
        requiredContents: ContentIdBaseItemJson[];
        containsInvalid: boolean;
        allPublishable: boolean;
    }
}
declare module api.content.json {
    interface WidgetDescriptorJson {
        url: string;
        displayName: string;
        interfaces: string[];
        key: string;
        config: {
            [key: string]: string;
        };
    }
}
declare module api.content.json {
    interface EffectivePermissionsJson {
        values: EffectivePermissionJson[];
    }
}
declare module api.content.json {
    interface EffectivePermissionJson {
        access: string;
        permissionAccessJson: EffectivePermissionAccessJson;
    }
}
declare module api.content.json {
    interface EffectivePermissionAccessJson {
        count: number;
        users: EffectivePermissionMemberJson[];
    }
}
declare module api.content.json {
    interface EffectivePermissionMemberJson {
        key: string;
        displayName: string;
    }
}
declare module api.content.json {
    interface GetContentVersionsForViewResultsJson {
        from: number;
        size: number;
        hits: number;
        totalHits: number;
        activeVersion: ActiveContentVersionJson;
        contentVersions: ContentVersionViewJson[];
    }
}
declare module api.content.json {
    interface ContentVersionViewJson extends ContentVersionJson {
        workspaces: string[];
    }
}
declare module api.content.json {
    interface ContentDependencyGroupJson {
        count: number;
        iconUrl: string;
        type: string;
    }
}
declare module api.content.json {
    interface ContentDependencyJson {
        inbound: ContentDependencyGroupJson[];
        outbound: ContentDependencyGroupJson[];
    }
}
declare module api.content.json {
    interface ContentsExistJson {
        contentsExistJson: ContentExistJson[];
    }
    interface ContentExistJson {
        contentId: string;
        exists: boolean;
    }
}
declare module api.content.json {
    interface MoveContentResultJson {
        successes: {
            name: string;
        }[];
        failures: {
            name: string;
            reason: string;
        }[];
    }
}
declare module api.content.json {
    interface ContentPublishTimeRangeJson {
        from: string;
        to: string;
        first: string;
    }
}
declare module api.content.json {
    interface GetPublishStatusResultJson {
        publishStatus: string;
        id: string;
    }
}
declare module api.content.json {
    interface GetPublishStatusesResultJson {
        publishStatuses: GetPublishStatusResultJson[];
    }
}
declare module api.content.json {
    interface UndoPendingDeleteContentResultJson {
        success: number;
    }
}
declare module api.content.json {
    interface HasUnpublishedChildrenListJson {
        contents: HasUnpublishedChildrenJson[];
    }
    interface HasUnpublishedChildrenJson {
        id: ContentIdBaseItemJson;
        hasChildren: boolean;
    }
}
declare module api.content.query {
    class ContentQuery implements api.Equitable {
        static POSTLOAD_SIZE: number;
        static DEFAULT_SIZE: number;
        private queryExpr;
        private contentTypeNames;
        private mustBeReferencedById;
        private aggregationQueries;
        private queryFilters;
        private from;
        private size;
        setQueryExpr(queryExpr: api.query.expr.QueryExpr): ContentQuery;
        getQueryExpr(): api.query.expr.QueryExpr;
        setContentTypeNames(contentTypeNames: api.schema.content.ContentTypeName[]): ContentQuery;
        getContentTypes(): api.schema.content.ContentTypeName[];
        setMustBeReferencedById(id: api.content.ContentId): ContentQuery;
        getMustBeReferencedById(): api.content.ContentId;
        setFrom(from: number): ContentQuery;
        getFrom(): number;
        setSize(size: number): ContentQuery;
        getSize(): number;
        addAggregationQuery(aggregationQuery: api.query.aggregation.AggregationQuery): ContentQuery;
        setAggregationQueries(aggregationQueries: api.query.aggregation.AggregationQuery[]): ContentQuery;
        getAggregationQueries(): api.query.aggregation.AggregationQuery[];
        addQueryFilter(queryFilter: api.query.filter.Filter): ContentQuery;
        setQueryFilters(queryFilters: api.query.filter.Filter[]): ContentQuery;
        getQueryFilters(): api.query.filter.Filter[];
        equals(o: api.Equitable): boolean;
    }
}
declare module api.content.attachment {
    interface AttachmentJson {
        name: string;
        label: string;
        mimeType: string;
        size: number;
    }
}
declare module api.content.attachment {
    interface AttachmentListJson {
        attachments: AttachmentJson[];
    }
}
declare module api.content.attachment {
    class AttachmentName implements api.Equitable {
        private fileName;
        constructor(fileName: string);
        equals(o: api.Equitable): boolean;
        toString(): string;
    }
}
declare module api.content.attachment {
    class Attachment implements api.Equitable {
        private name;
        private label;
        private mimeType;
        private size;
        constructor(builder: AttachmentBuilder);
        getBinaryReference(): api.util.BinaryReference;
        getName(): AttachmentName;
        getLabel(): string;
        getMimeType(): string;
        getSize(): number;
        equals(o: api.Equitable): boolean;
        toJson(): api.content.attachment.AttachmentJson;
        static create(): AttachmentBuilder;
    }
    class AttachmentBuilder {
        name: AttachmentName;
        label: string;
        mimeType: string;
        size: number;
        fromJson(json: AttachmentJson): AttachmentBuilder;
        setName(value: AttachmentName): AttachmentBuilder;
        setLabel(value: string): AttachmentBuilder;
        setMimeType(value: string): AttachmentBuilder;
        setSize(value: number): AttachmentBuilder;
        build(): Attachment;
    }
}
declare module api.content.attachment {
    class Attachments implements api.Equitable {
        private attachmentByName;
        private attachmentByLabel;
        private attachments;
        private size;
        constructor(builder: AttachmentsBuilder);
        forEach(callBack: {
            (attachment: Attachment, index: number): void;
        }): void;
        getAttachmentByName(name: string): Attachment;
        getAttachmentByLabel(label: string): Attachment;
        getAttachment(index: number): Attachment;
        getSize(): number;
        equals(o: api.Equitable): boolean;
        static create(): AttachmentsBuilder;
    }
    class AttachmentsBuilder {
        attachments: Attachment[];
        fromJson(jsons: AttachmentJson[]): AttachmentsBuilder;
        add(value: Attachment): AttachmentsBuilder;
        addAll(value: Attachment[]): AttachmentsBuilder;
        build(): Attachments;
    }
}
declare module api.content.attachment {
    import Attachment = api.content.attachment.Attachment;
    import AttachmentJson = api.content.attachment.AttachmentJson;
    class AttachmentUploaderEl extends api.ui.uploader.FileUploaderEl<Attachment> {
        private attachmentItems;
        private removeCallback;
        private addCallback;
        constructor(config: any);
        createModel(serverResponse: AttachmentJson): Attachment;
        getModelValue(item: Attachment): string;
        removeAttachmentItem(value: string): void;
        getExistingItem(value: string): api.dom.Element;
        createResultItem(value: string): api.dom.Element;
        maximumOccurrencesReached(): boolean;
    }
}
declare module api.content.attachment {
    class AttachmentItem extends api.dom.DivEl {
        private link;
        private removeEl;
        private value;
        constructor(contentId: string, value: string, removeCallback?: (value: any) => void);
        private initRemoveButton(callback?);
        getValue(): string;
        doRender(): wemQ.Promise<boolean>;
    }
}
declare module api.content.event {
    class ContentDeletedEvent extends api.event.Event {
        private contentDeletedItems;
        private undeletedItems;
        constructor();
        addItem(contentId: ContentId, contentPath: api.content.ContentPath, branch: string): ContentDeletedEvent;
        addPendingItem(contentSummary: ContentSummaryAndCompareStatus): ContentDeletedEvent;
        addUndeletedItem(contentSummary: ContentSummaryAndCompareStatus): ContentDeletedEvent;
        getDeletedItems(): ContentDeletedItem[];
        getUndeletedItems(): ContentDeletedItem[];
        isEmpty(): boolean;
        fire(contextWindow?: Window): void;
        static on(handler: (event: ContentDeletedEvent) => void): void;
        static un(handler?: (event: ContentDeletedEvent) => void): void;
    }
    class ContentDeletedItem {
        private contentPath;
        private contentId;
        private branch;
        constructor(contentId: ContentId, contentPath: api.content.ContentPath, branch: string);
        getBranch(): string;
        getContentPath(): ContentPath;
        getContentId(): ContentId;
        isPending(): boolean;
        getCompareStatus(): api.content.CompareStatus;
    }
    class ContentPendingDeleteItem extends ContentDeletedItem {
        private pending;
        private compareStatus;
        constructor(contentSummary: ContentSummaryAndCompareStatus, pending?: boolean);
        isPending(): boolean;
        getCompareStatus(): api.content.CompareStatus;
    }
}
declare module api.content.event {
    class ContentUpdatedEvent extends api.event.Event {
        private contentSummary;
        constructor(contentSummary: api.content.ContentSummary);
        getContentId(): api.content.ContentId;
        getContentSummary(): api.content.ContentSummary;
        static on(handler: (event: ContentUpdatedEvent) => void): void;
        static un(handler?: (event: ContentUpdatedEvent) => void): void;
    }
}
declare module api.content.event {
    import ContentPath = api.content.ContentPath;
    /**
     * Class that listens to server events and fires UI events
     */
    class ContentServerEventsHandler {
        private static instance;
        private handler;
        private contentCreatedListeners;
        private contentUpdatedListeners;
        private contentDeletedListeners;
        private contentMovedListeners;
        private contentRenamedListeners;
        private contentPublishListeners;
        private contentUnpublishListeners;
        private contentPendingListeners;
        private contentDuplicateListeners;
        private contentSortListeners;
        private static debug;
        constructor();
        static getInstance(): ContentServerEventsHandler;
        start(): void;
        stop(): void;
        private contentServerEventHandler(event);
        private hasDraftBranchChanges(changes);
        private extractContentPaths(changes);
        private extractNewContentPaths(changes);
        private extractContentIds(changes);
        private handleContentCreated(data);
        private handleContentUpdated(data);
        private handleContentRenamed(data, oldPaths);
        private handleContentDeleted(changeItems);
        private handleContentPending(data);
        private handleContentDuplicated(data);
        private handleContentPublished(data);
        private handleContentUnpublished(data);
        private handleContentMoved(data, oldPaths);
        private handleContentSorted(data);
        onContentCreated(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        unContentCreated(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        private notifyContentCreated(data);
        onContentUpdated(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        unContentUpdated(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        private notifyContentUpdated(data);
        onContentDeleted(listener: (paths: ContentServerChangeItem[], pending?: boolean) => void): void;
        unContentDeleted(listener: (paths: ContentServerChangeItem[], pending?: boolean) => void): void;
        private notifyContentDeleted(paths, pending?);
        onContentMoved(listener: (data: ContentSummaryAndCompareStatus[], oldPaths: ContentPath[]) => void): void;
        unContentMoved(listener: (data: ContentSummaryAndCompareStatus[], oldPaths: ContentPath[]) => void): void;
        private notifyContentMoved(data, oldPaths);
        onContentRenamed(listener: (data: ContentSummaryAndCompareStatus[], oldPaths: ContentPath[]) => void): void;
        unContentRenamed(listener: (data: ContentSummaryAndCompareStatus[], oldPaths: ContentPath[]) => void): void;
        private notifyContentRenamed(data, oldPaths);
        onContentDuplicated(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        unContentDuplicated(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        private notifyContentDuplicated(data);
        onContentPublished(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        unContentPublished(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        private notifyContentPublished(data);
        onContentUnpublished(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        unContentUnpublished(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        private notifyContentUnpublished(data);
        onContentPending(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        unContentPending(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        private notifyContentPending(data);
        onContentSorted(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        unContentSorted(listener: (data: ContentSummaryAndCompareStatus[]) => void): void;
        private notifyContentSorted(data);
    }
}
declare module api.content.event {
    class ContentServerEvent extends api.event.NodeServerEvent {
        constructor(change: ContentServerChange);
        getNodeChange(): ContentServerChange;
        static is(eventJson: api.event.NodeEventJson): boolean;
        static fromJson(nodeEventJson: api.event.NodeEventJson): ContentServerEvent;
    }
}
declare module api.content.event {
    import NodeEventJson = api.event.NodeEventJson;
    import NodeEventNodeJson = api.event.NodeEventNodeJson;
    import NodeServerChange = api.event.NodeServerChange;
    import NodeServerChangeType = api.event.NodeServerChangeType;
    import NodeServerChangeItem = api.event.NodeServerChangeItem;
    class ContentServerChangeItem extends NodeServerChangeItem<ContentPath> {
        contentId: api.content.ContentId;
        constructor(contentPath: api.content.ContentPath, branch: string, contentId: api.content.ContentId);
        getContentId(): api.content.ContentId;
        static fromJson(node: NodeEventNodeJson): ContentServerChangeItem;
    }
    class ContentServerChange extends NodeServerChange<ContentPath> {
        protected changeItems: ContentServerChangeItem[];
        protected newContentPaths: ContentPath[];
        constructor(type: NodeServerChangeType, changeItems: ContentServerChangeItem[], newContentPaths?: ContentPath[]);
        getChangeItems(): ContentServerChangeItem[];
        getNewContentPaths(): ContentPath[];
        toString(): string;
        static fromJson(nodeEventJson: NodeEventJson): ContentServerChange;
    }
}
declare module api.content.event {
    class ContentNamedEvent extends api.event.Event {
        private wizard;
        private content;
        constructor(wizard: api.app.wizard.WizardPanel<Content>, content: Content);
        getWizard(): api.app.wizard.WizardPanel<Content>;
        getContent(): Content;
        static on(handler: (event: ContentNamedEvent) => void): void;
        static un(handler?: (event: ContentNamedEvent) => void): void;
    }
}
declare module api.content.event {
    import NodeServerChangeType = api.event.NodeServerChangeType;
    class BatchContentServerEvent extends api.event.Event {
        private events;
        private type;
        constructor(events: ContentServerEvent[], type: NodeServerChangeType);
        getEvents(): ContentServerEvent[];
        getType(): NodeServerChangeType;
        toString(): string;
        static on(handler: (event: BatchContentServerEvent) => void): void;
        static un(handler?: (event: BatchContentServerEvent) => void): void;
    }
}
declare module api.content.event {
    class EditContentEvent extends api.event.Event {
        private model;
        constructor(model: api.content.ContentSummaryAndCompareStatus[]);
        getModels(): api.content.ContentSummaryAndCompareStatus[];
        static on(handler: (event: EditContentEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: EditContentEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.content.event {
    class ActiveContentVersionSetEvent extends api.event.Event {
        private contentId;
        private versionId;
        constructor(contentId: api.content.ContentId, versionId: string);
        getContentId(): api.content.ContentId;
        getVersionId(): string;
        static on(handler: (event: ActiveContentVersionSetEvent) => void): void;
        static un(handler?: (event: ActiveContentVersionSetEvent) => void): void;
    }
}
declare module api.content.event {
    import ContentId = api.content.ContentId;
    class ContentRequiresSaveEvent extends api.event.Event {
        private contentId;
        constructor(contentId: ContentId);
        getContentId(): ContentId;
        static on(handler: (event: ContentRequiresSaveEvent) => void): void;
        static un(handler?: (event: ContentRequiresSaveEvent) => void): void;
    }
}
import ContentId = api.content.ContentId;
import AccessControlList = api.security.acl.AccessControlList;
import Content = api.content.Content;
declare module api.content.event {
    class OpenEditPermissionsDialogEvent extends api.event.Event {
        private contentId;
        private contentPath;
        private displayName;
        private permissions;
        private inheritPermissions;
        private overwritePermissions;
        private immediateApply;
        constructor(builder: Builder);
        getContentId(): ContentId;
        getContentPath(): ContentPath;
        getDisplayName(): string;
        getPermissions(): AccessControlList;
        isInheritPermissions(): boolean;
        isOverwritePermissions(): boolean;
        isImmediateApply(): boolean;
        static create(): Builder;
        static on(handler: (event: OpenEditPermissionsDialogEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: OpenEditPermissionsDialogEvent) => void, contextWindow?: Window): void;
    }
    class Builder {
        contentId: ContentId;
        contentPath: ContentPath;
        displayName: string;
        permissions: AccessControlList;
        inheritPermissions: boolean;
        overwritePermissions: boolean;
        immediateApply: boolean;
        setContentId(value: ContentId): Builder;
        setContentPath(value: ContentPath): Builder;
        setDisplayName(value: string): Builder;
        setPermissions(value: AccessControlList): Builder;
        setInheritPermissions(value: boolean): Builder;
        setOverwritePermissions(value: boolean): Builder;
        setImmediateApply(value: boolean): Builder;
        applyContent(content: Content): Builder;
        build(): OpenEditPermissionsDialogEvent;
    }
}
declare module api.content.event {
    class BeforeContentSavedEvent extends api.event.Event {
        static on(handler: (event: BeforeContentSavedEvent) => void): void;
        static un(handler?: (event: BeforeContentSavedEvent) => void): void;
    }
}
declare module api.content.resource.result {
    class ContentResponse<T> {
        private contents;
        private metadata;
        constructor(contents: T[], metadata: ContentMetadata);
        getContents(): T[];
        getMetadata(): ContentMetadata;
        setContents(contents: T[]): ContentResponse<T>;
        setMetadata(metadata: ContentMetadata): ContentResponse<T>;
    }
}
declare module api.content.resource.result {
    interface ListContentResult<T> {
        contents: T[];
        metadata: ContentMetadata;
    }
}
declare module api.content.resource.result {
    interface BatchContentResult<T> {
        contents: T[];
        metadata: ContentMetadata;
    }
}
declare module api.content.resource.result {
    import MoveContentResultJson = api.content.json.MoveContentResultJson;
    class MoveContentResult {
        private moveSuccess;
        private moveFailures;
        constructor(success: string[], failures: MoveContentResultFailure[]);
        getMoved(): string[];
        getMoveFailures(): MoveContentResultFailure[];
        static fromJson(json: MoveContentResultJson): MoveContentResult;
    }
    class MoveContentResultFailure {
        private name;
        private reason;
        constructor(name: string, reason: string);
        getName(): string;
        getReason(): string;
    }
}
declare module api.content.resource.result {
    class ContentQueryResult<C extends ContentIdBaseItem, CJ extends json.ContentIdBaseItemJson> {
        private contents;
        private aggregations;
        private contentsAsJson;
        private metadata;
        constructor(contents: C[], aggreations: api.aggregation.Aggregation[], contentsAsJson: CJ[], metadata?: ContentMetadata);
        getContents(): C[];
        getContentsAsJson(): CJ[];
        getAggregations(): api.aggregation.Aggregation[];
        getMetadata(): ContentMetadata;
    }
}
declare module api.content.resource.result {
    import ResolvePublishContentResultJson = api.content.json.ResolvePublishContentResultJson;
    class ResolvePublishDependenciesResult {
        dependentContents: ContentId[];
        requestedContents: ContentId[];
        requiredContents: ContentId[];
        containsInvalid: boolean;
        allPublishable: boolean;
        constructor(builder: Builder);
        getDependants(): ContentId[];
        getRequested(): ContentId[];
        getRequired(): ContentId[];
        isContainsInvalid(): boolean;
        isAllPublishable(): boolean;
        static fromJson(json: ResolvePublishContentResultJson): ResolvePublishDependenciesResult;
        static create(): Builder;
    }
    class Builder {
        dependentContents: ContentId[];
        requestedContents: ContentId[];
        requiredContents: ContentId[];
        containsInvalid: boolean;
        allPublishable: boolean;
        setDependentContents(value: ContentId[]): Builder;
        setRequestedContents(value: ContentId[]): Builder;
        setRequiredContents(value: ContentId[]): Builder;
        setContainsInvalid(value: boolean): Builder;
        setAllPublishable(value: boolean): Builder;
        build(): ResolvePublishDependenciesResult;
    }
}
declare module api.content.resource.result {
    class CompareContentResults {
        private compareContentResults;
        constructor(compareContentResults: CompareContentResult[]);
        get(contentId: string): CompareContentResult;
        getAll(): CompareContentResult[];
        static fromJson(json: api.content.json.CompareContentResultsJson): CompareContentResults;
    }
}
declare module api.content.resource.result {
    class CompareContentResult implements api.Equitable {
        compareStatus: CompareStatus;
        id: string;
        publishStatus: PublishStatus;
        constructor(id: string, compareStatus: CompareStatus, publishStatus: PublishStatus);
        getId(): string;
        getCompareStatus(): CompareStatus;
        getPublishStatus(): PublishStatus;
        equals(o: api.Equitable): boolean;
        static fromJson(json: api.content.json.CompareContentResultJson): CompareContentResult;
    }
}
declare module api.content.resource.result {
    class ContentsExistResult {
        private contentsExistMap;
        constructor(json: api.content.json.ContentsExistJson);
        contentExists(id: string): boolean;
    }
}
declare module api.content.resource.result {
    class GetPublishStatusResult implements api.Equitable {
        publishStatus: api.content.PublishStatus;
        id: string;
        constructor(id: string, publishStatus: PublishStatus);
        getId(): string;
        getPublishStatus(): PublishStatus;
        equals(o: api.Equitable): boolean;
        static fromJson(json: api.content.json.GetPublishStatusResultJson): GetPublishStatusResult;
    }
}
declare module api.content.resource.result {
    class GetPublishStatusesResult {
        private getPublishStatusesResult;
        constructor(getPublishStatusesResult: GetPublishStatusResult[]);
        get(contentId: string): GetPublishStatusResult;
        getAll(): GetPublishStatusResult[];
        static fromJson(json: api.content.json.GetPublishStatusesResultJson): GetPublishStatusesResult;
    }
}
declare module api.content.resource.result {
    import HasUnpublishedChildrenJson = api.content.json.HasUnpublishedChildrenJson;
    import HasUnpublishedChildrenListJson = api.content.json.HasUnpublishedChildrenListJson;
    class HasUnpublishedChildrenResult {
        private contents;
        constructor(contents: HasUnpublishedChildren[]);
        getResult(): HasUnpublishedChildren[];
        static fromJson(json: HasUnpublishedChildrenListJson): HasUnpublishedChildrenResult;
    }
    class HasUnpublishedChildren {
        private id;
        private hasChildren;
        constructor(id: string, hasChildren: boolean);
        static fromJson(json: HasUnpublishedChildrenJson): HasUnpublishedChildren;
        getId(): ContentId;
        getHasChildren(): boolean;
    }
}
declare module api.content.resource {
    import OrderExpr = api.query.expr.OrderExpr;
    import FieldOrderExpr = api.query.expr.FieldOrderExpr;
    import ConstraintExpr = api.query.expr.ConstraintExpr;
    import ContentQueryResultJson = api.content.json.ContentQueryResultJson;
    import ContentSummaryJson = api.content.json.ContentSummaryJson;
    class ContentSummaryRequest extends api.rest.ResourceRequest<ContentQueryResultJson<ContentSummaryJson>, ContentSummary[]> {
        private path;
        private searchString;
        private request;
        static MODIFIED_TIME_DESC: FieldOrderExpr;
        static SCORE_DESC: FieldOrderExpr;
        static PATH_ASC: FieldOrderExpr;
        static DEFAULT_ORDER: OrderExpr[];
        constructor();
        getSearchString(): string;
        getRestPath(): api.rest.Path;
        getRequestPath(): api.rest.Path;
        getContentPath(): ContentPath;
        getParams(): Object;
        send(): wemQ.Promise<api.rest.JsonResponse<ContentQueryResultJson<ContentSummaryJson>>>;
        sendAndParse(): wemQ.Promise<ContentSummary[]>;
        setAllowedContentTypes(contentTypes: string[]): void;
        setAllowedContentTypeNames(contentTypeNames: api.schema.content.ContentTypeName[]): void;
        setSize(size: number): void;
        setContentPath(path: ContentPath): void;
        setSearchString(value?: string): void;
        isPartiallyLoaded(): boolean;
        resetParams(): void;
        private buildSearchQueryExpr();
        protected getDefaultOrder(): OrderExpr[];
        protected createSearchExpression(): ConstraintExpr;
        private createContentTypeNames(names);
    }
}
declare module api.content.resource {
    import ConstraintExpr = api.query.expr.ConstraintExpr;
    import OrderExpr = api.query.expr.OrderExpr;
    class MoveAllowedTargetsRequest extends ContentSummaryRequest {
        private filterContentPaths;
        protected createSearchExpression(): ConstraintExpr;
        private createChildPathsExpr();
        setFilterContentPaths(contentPaths: ContentPath[]): void;
        protected getDefaultOrder(): OrderExpr[];
    }
}
declare module api.content.resource {
    import ContentSummary = api.content.ContentSummary;
    import PostLoader = api.util.loader.PostLoader;
    import ContentQueryResultJson = api.content.json.ContentQueryResultJson;
    import ContentSummaryJson = api.content.json.ContentSummaryJson;
    class ContentSummaryPreLoader extends PostLoader<ContentQueryResultJson<ContentSummaryJson>, ContentSummary> {
        protected sendPreLoadRequest(ids: string): Q.Promise<ContentSummary[]>;
    }
}
declare module api.content.resource {
    class ContentSummaryLoader extends ContentSummaryPreLoader {
        protected request: ContentSummaryRequest;
        constructor();
        protected createRequest(): ContentSummaryRequest;
        protected getRequest(): ContentSummaryRequest;
        setAllowedContentTypes(contentTypes: string[]): void;
        setAllowedContentTypeNames(contentTypeNames: api.schema.content.ContentTypeName[]): void;
        setSize(size: number): void;
        setContentPath(path: ContentPath): void;
        isPartiallyLoaded(): boolean;
        private setSearchQueryExpr(searchString?);
        resetParams(): void;
        search(searchString: string): wemQ.Promise<ContentSummary[]>;
    }
}
declare module api.content.resource {
    import ConstraintExpr = api.query.expr.ConstraintExpr;
    class FragmentContentSummaryRequest extends ContentSummaryRequest {
        private parentSitePath;
        protected createSearchExpression(): ConstraintExpr;
        private createParentSiteFragmentsOnlyQuery();
        setParentSitePath(sitePath: string): void;
    }
}
declare module api.content.resource {
    class FragmentContentSummaryLoader extends ContentSummaryLoader {
        protected request: FragmentContentSummaryRequest;
        constructor();
        protected createRequest(): FragmentContentSummaryRequest;
        setParentSitePath(parentSitePath: string): FragmentContentSummaryLoader;
        setAllowedContentTypes(contentTypes: string[]): void;
        setAllowedContentTypeNames(contentTypeNames: api.schema.content.ContentTypeName[]): void;
    }
}
declare module api.content.resource {
    import ContentType = api.schema.content.ContentType;
    class MoveContentSummaryLoader extends ContentSummaryLoader {
        protected request: MoveAllowedTargetsRequest;
        private filterContentPaths;
        private filterContentTypes;
        protected createRequest(): MoveAllowedTargetsRequest;
        protected getRequest(): MoveAllowedTargetsRequest;
        setSize(size: number): void;
        setFilterContentPaths(contentPaths: ContentPath[]): void;
        setFilterContentTypes(contentTypes: ContentType[]): void;
        search(searchString: string): wemQ.Promise<ContentSummary[]>;
        resetSearchString(): void;
        load(postLoad?: boolean): wemQ.Promise<ContentSummary[]>;
        isPartiallyLoaded(): boolean;
        resetParams(): void;
        private filterContent(contents, contentTypes);
    }
}
declare module api.content.resource {
    class ContentResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        static EXPAND_NONE: string;
        static EXPAND_SUMMARY: string;
        static EXPAND_FULL: string;
        private resourcePath;
        constructor();
        getResourcePath(): api.rest.Path;
        fromJsonToContent(json: json.ContentJson): Content;
        fromJsonToContentArray(json: json.ContentJson[]): Content[];
        fromJsonToContentSummary(json: json.ContentSummaryJson): ContentSummary;
        fromJsonToContentSummaryArray(json: json.ContentSummaryJson[]): ContentSummary[];
        fromJsonToContentIdBaseItem(json: json.ContentIdBaseItemJson): ContentIdBaseItem;
        fromJsonToContentIdBaseItemArray(jsonArray: json.ContentIdBaseItemJson[]): ContentIdBaseItem[];
    }
}
declare module api.content.resource {
    class ApplyContentPermissionsRequest extends ContentResourceRequest<api.content.json.ContentJson, Content> {
        private id;
        private permissions;
        private inheritPermissions;
        private overwriteChildPermissions;
        constructor();
        setId(id: ContentId): ApplyContentPermissionsRequest;
        setPermissions(permissions: api.security.acl.AccessControlList): ApplyContentPermissionsRequest;
        setInheritPermissions(inheritPermissions: boolean): ApplyContentPermissionsRequest;
        setOverwriteChildPermissions(overwriteChildPermissions: boolean): ApplyContentPermissionsRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Content>;
    }
}
declare module api.content.resource {
    import ContentJson = api.content.json.ContentJson;
    class GetContentByIdRequest extends ContentResourceRequest<ContentJson, Content> {
        private id;
        private expand;
        constructor(id: ContentId);
        setExpand(expand: string): GetContentByIdRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Content>;
    }
}
declare module api.content.resource {
    import ContentSummaryJson = api.content.json.ContentSummaryJson;
    class GetContentSummaryByIdRequest extends ContentResourceRequest<ContentSummaryJson, ContentSummary> {
        private id;
        private expand;
        constructor(id: ContentId);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentSummary>;
    }
}
declare module api.content.resource {
    import BatchContentResult = api.content.resource.result.BatchContentResult;
    import ContentSummaryJson = api.content.json.ContentSummaryJson;
    class GetContentSummaryByIds extends ContentResourceRequest<BatchContentResult<ContentSummaryJson>, ContentSummary[]> {
        private ids;
        constructor(ids: ContentId[]);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentSummary[]>;
    }
}
declare module api.content.resource {
    import ContentJson = api.content.json.ContentJson;
    class GetContentByPathRequest extends ContentResourceRequest<ContentJson, Content> {
        private contentPath;
        constructor(path: ContentPath);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Content>;
    }
}
declare module api.content.resource {
    import AccessControlList = api.security.acl.AccessControlList;
    import PermissionsJson = api.content.json.PermissionsJson;
    class GetContentPermissionsByIdRequest extends ContentResourceRequest<PermissionsJson, AccessControlList> {
        private contentId;
        constructor(contentId: ContentId);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<AccessControlList>;
    }
}
declare module api.content.resource {
    import ContentsPermissionsEntryJson = api.content.json.ContentPermissionsJson;
    import ContentAccessControlList = api.security.acl.ContentAccessControlList;
    class GetContentPermissionsByIdsRequest extends ContentResourceRequest<ContentsPermissionsEntryJson[], ContentAccessControlList[]> {
        private contentIds;
        constructor(contentIds: ContentId[]);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentAccessControlList[]>;
    }
}
declare module api.content.resource {
    import Permission = api.security.acl.Permission;
    class GetPermittedActionsRequest extends ContentResourceRequest<string[], Permission[]> {
        private contentIds;
        private permissions;
        constructor();
        addContentIds(...contentIds: ContentId[]): GetPermittedActionsRequest;
        addPermissionsToBeChecked(...permissions: Permission[]): GetPermittedActionsRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Permission[]>;
    }
}
declare module api.content.resource {
    import AccessControlList = api.security.acl.AccessControlList;
    import PermissionsJson = api.content.json.PermissionsJson;
    class GetContentRootPermissionsRequest extends ContentResourceRequest<PermissionsJson, AccessControlList> {
        constructor();
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<AccessControlList>;
    }
}
declare module api.content.resource {
    class GetContentAttachmentsRequest extends ContentResourceRequest<any, any> {
        private contentId;
        constructor(contentId: ContentId);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<any>;
    }
}
declare module api.content.resource {
    class CreateContentRequest extends ContentResourceRequest<api.content.json.ContentJson, Content> {
        private valid;
        private requireValid;
        private name;
        private parent;
        private contentType;
        private data;
        private meta;
        private displayName;
        constructor();
        setValid(value: boolean): CreateContentRequest;
        setRequireValid(value: boolean): CreateContentRequest;
        setName(value: ContentName): CreateContentRequest;
        setParent(value: ContentPath): CreateContentRequest;
        setContentType(value: api.schema.content.ContentTypeName): CreateContentRequest;
        setData(data: api.data.PropertyTree): CreateContentRequest;
        setExtraData(extraData: ExtraData[]): CreateContentRequest;
        setDisplayName(displayName: string): CreateContentRequest;
        getParams(): Object;
        private extraDataToJson();
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Content>;
    }
}
declare module api.content.resource {
    class OrderContentRequest extends ContentResourceRequest<any, any> {
        private silent;
        private contentId;
        private childOrder;
        constructor();
        setContentId(value: ContentId): OrderContentRequest;
        setChildOrder(value: api.content.order.ChildOrder): OrderContentRequest;
        setSilent(silent: boolean): OrderContentRequest;
        getParams(): Object;
        private contentToJson();
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Content>;
    }
}
declare module api.content.resource {
    class OrderChildContentRequest extends ContentResourceRequest<any, any> {
        private silent;
        private manualOrder;
        private contentId;
        private childOrder;
        private contentMovements;
        constructor();
        setSilent(silent: boolean): OrderChildContentRequest;
        setManualOrder(manualOrder: boolean): OrderChildContentRequest;
        setContentId(value: ContentId): OrderChildContentRequest;
        setChildOrder(value: api.content.order.ChildOrder): OrderChildContentRequest;
        setContentMovements(value: api.content.order.OrderChildMovements): OrderChildContentRequest;
        getParams(): json.ReorderChildContentsJson;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<any>;
    }
}
declare module api.content.resource {
    class UpdateContentRequest extends ContentResourceRequest<api.content.json.ContentJson, Content> {
        private id;
        private name;
        private data;
        private meta;
        private displayName;
        private requireValid;
        private language;
        private owner;
        private publishFrom;
        private publishTo;
        private permissions;
        private inheritPermissions;
        private overwritePermissions;
        constructor(id: string);
        setId(id: string): UpdateContentRequest;
        setContentName(value: ContentName): UpdateContentRequest;
        setData(contentData: api.data.PropertyTree): UpdateContentRequest;
        setExtraData(extraData: ExtraData[]): UpdateContentRequest;
        setDisplayName(displayName: string): UpdateContentRequest;
        setRequireValid(requireValid: boolean): UpdateContentRequest;
        setLanguage(language: string): UpdateContentRequest;
        setOwner(owner: api.security.PrincipalKey): UpdateContentRequest;
        setPublishFrom(date: Date): UpdateContentRequest;
        setPublishTo(date: Date): UpdateContentRequest;
        setPermissions(permissions: api.security.acl.AccessControlList): UpdateContentRequest;
        setInheritPermissions(inheritPermissions: boolean): UpdateContentRequest;
        setOverwritePermissions(overwritePermissions: boolean): UpdateContentRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Content>;
    }
}
declare module api.content.resource {
    import ContentJson = api.content.json.ContentJson;
    class DuplicateContentRequest extends ContentResourceRequest<ContentJson, Content> {
        private id;
        constructor(id: ContentId);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Content>;
    }
}
declare module api.content.resource {
    import MoveContentResultJson = api.content.json.MoveContentResultJson;
    import MoveContentResult = api.content.resource.result.MoveContentResult;
    class MoveContentRequest extends ContentResourceRequest<MoveContentResultJson, MoveContentResult> {
        private ids;
        private parentPath;
        constructor(id: ContentIds, parentPath: ContentPath);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<MoveContentResult>;
    }
}
declare module api.content.resource {
    import ListContentResult = api.content.resource.result.ListContentResult;
    import ContentResponse = api.content.resource.result.ContentResponse;
    import ContentSummaryJson = api.content.json.ContentSummaryJson;
    class ListContentByIdRequest extends ContentResourceRequest<ListContentResult<ContentSummaryJson>, ContentResponse<ContentSummary>> {
        private parentId;
        private expand;
        private from;
        private size;
        private order;
        constructor(parentId: ContentId);
        setExpand(value: api.rest.Expand): ListContentByIdRequest;
        setFrom(value: number): ListContentByIdRequest;
        setSize(value: number): ListContentByIdRequest;
        setOrder(value: api.content.order.ChildOrder): ListContentByIdRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentResponse<ContentSummary>>;
    }
}
declare module api.content.resource {
    class IsContentReadOnlyRequest extends ContentResourceRequest<string[], string[]> {
        private ids;
        constructor(ids: ContentId[]);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<string[]>;
    }
}
declare module api.content.resource {
    import ListContentResult = api.content.resource.result.ListContentResult;
    import ContentResponse = api.content.resource.result.ContentResponse;
    import ContentSummaryJson = api.content.json.ContentSummaryJson;
    class ListContentByPathRequest<T> extends ContentResourceRequest<ListContentResult<ContentSummaryJson>, ContentResponse<ContentSummary>> {
        private parentPath;
        private expand;
        private from;
        private size;
        constructor(parentPath: ContentPath);
        setExpand(value: api.rest.Expand): ListContentByPathRequest<T>;
        setFrom(value: number): ListContentByPathRequest<T>;
        setSize(value: number): ListContentByPathRequest<T>;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentResponse<ContentSummary>>;
    }
}
declare module api.content.resource {
    class DeleteContentRequest extends ContentResourceRequest<api.task.TaskIdJson, api.task.TaskId> {
        private contentPaths;
        private deleteOnline;
        constructor(contentPath?: ContentPath);
        setContentPaths(contentPaths: ContentPath[]): DeleteContentRequest;
        addContentPath(contentPath: ContentPath): DeleteContentRequest;
        setDeleteOnline(deleteOnline: boolean): void;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<api.task.TaskId>;
        sendAndParseWithPolling(): wemQ.Promise<string>;
    }
}
declare module api.content.resource {
    import BatchContentResult = api.content.resource.result.BatchContentResult;
    import ContentResponse = api.content.resource.result.ContentResponse;
    import ContentSummaryJson = api.content.json.ContentSummaryJson;
    class BatchContentRequest extends ContentResourceRequest<BatchContentResult<ContentSummaryJson>, ContentResponse<ContentSummary>> {
        private contentPaths;
        constructor(contentPath?: ContentPath);
        setContentPaths(contentPaths: ContentPath[]): BatchContentRequest;
        addContentPath(contentPath: ContentPath): BatchContentRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentResponse<ContentSummary>>;
    }
}
declare module api.content.resource {
    import ContentQuery = api.content.query.ContentQuery;
    import ContentQueryResult = api.content.resource.result.ContentQueryResult;
    import ContentIdBaseItemJson = api.content.json.ContentIdBaseItemJson;
    import ContentQueryResultJson = api.content.json.ContentQueryResultJson;
    class ContentQueryRequest<CONTENT_JSON extends ContentIdBaseItemJson, CONTENT extends ContentIdBaseItem> extends ContentResourceRequest<ContentQueryResultJson<CONTENT_JSON>, ContentQueryResult<CONTENT, CONTENT_JSON>> {
        private contentQuery;
        private expand;
        private allLoaded;
        private results;
        constructor(contentQuery: ContentQuery);
        getContentQuery(): ContentQuery;
        setExpand(expand: api.rest.Expand): ContentQueryRequest<CONTENT_JSON, CONTENT>;
        isPartiallyLoaded(): boolean;
        resetParams(): void;
        getParams(): Object;
        sendAndParse(): wemQ.Promise<ContentQueryResult<CONTENT, CONTENT_JSON>>;
        private updateStateAfterLoad(contents, metadata);
        private getMustBereferencedById();
        private aggregationQueriesToJson(aggregationQueries);
        private queryFiltersToJson(queryFilters);
        private expandAsString();
        contentTypeNamesAsString(names: api.schema.content.ContentTypeName[]): string[];
        getRequestPath(): api.rest.Path;
    }
}
declare module api.content.resource {
    import OrderExpr = api.query.expr.OrderExpr;
    import FieldOrderExpr = api.query.expr.FieldOrderExpr;
    import ContentSummaryJson = api.content.json.ContentSummaryJson;
    import ContentId = api.content.ContentId;
    import ContentState = api.schema.content.ContentState;
    import ContentTypeName = api.schema.content.ContentTypeName;
    class ContentTreeSelectorQueryRequest extends ContentResourceRequest<ContentTreeSelectorItemJson[], ContentTreeSelectorItem[]> {
        static DEFAULT_SIZE: number;
        static MODIFIED_TIME_DESC: FieldOrderExpr;
        static SCORE_DESC: FieldOrderExpr;
        static DEFAULT_ORDER: OrderExpr[];
        private queryExpr;
        private from;
        private size;
        private expand;
        private content;
        private inputName;
        private contentTypeNames;
        private allowedContentPaths;
        private relationshipType;
        private loaded;
        private results;
        private parentPath;
        constructor();
        setInputName(name: string): void;
        getInputName(): string;
        setContent(content: ContentSummary): void;
        getContent(): ContentSummary;
        setFrom(from: number): void;
        getFrom(): number;
        setSize(size: number): void;
        getSize(): number;
        setContentTypeNames(contentTypeNames: string[]): void;
        setAllowedContentPaths(allowedContentPaths: string[]): void;
        setRelationshipType(relationshipType: string): void;
        setQueryExpr(searchString?: string): void;
        setParentPath(parentPath: ContentPath): void;
        private createSearchExpression(searchString);
        getQueryExpr(): api.query.expr.QueryExpr;
        getRequestPath(): api.rest.Path;
        isPartiallyLoaded(): boolean;
        isLoaded(): boolean;
        resetParams(): void;
        getParams(): Object;
        sendAndParse(): wemQ.Promise<ContentTreeSelectorItem[]>;
        private expandAsString();
    }
    class ContentTreeSelectorItemJson {
        content: ContentSummaryJson;
        expand: boolean;
    }
    class ContentTreeSelectorItem {
        private content;
        private expand;
        constructor(content: ContentSummary, expand: boolean);
        static fromJson(json: ContentTreeSelectorItemJson): ContentTreeSelectorItem;
        getContent(): ContentSummary;
        getId(): string;
        getContentId(): ContentId;
        getPath(): ContentPath;
        getName(): ContentName;
        getDisplayName(): string;
        getContentState(): ContentState;
        hasChildren(): boolean;
        isValid(): boolean;
        getIconUrl(): string;
        getType(): ContentTypeName;
        isImage(): boolean;
        isSite(): boolean;
        getExpand(): boolean;
    }
}
declare module api.content.resource {
    import OrderExpr = api.query.expr.OrderExpr;
    import FieldOrderExpr = api.query.expr.FieldOrderExpr;
    import ContentSummaryJson = api.content.json.ContentSummaryJson;
    import ContentQueryResultJson = api.content.json.ContentQueryResultJson;
    class ContentSelectorQueryRequest extends ContentResourceRequest<ContentQueryResultJson<ContentSummaryJson>, ContentSummary[]> {
        static DEFAULT_SIZE: number;
        static MODIFIED_TIME_DESC: FieldOrderExpr;
        static SCORE_DESC: FieldOrderExpr;
        static DEFAULT_ORDER: OrderExpr[];
        private queryExpr;
        private from;
        private size;
        private expand;
        private content;
        private inputName;
        private contentTypeNames;
        private allowedContentPaths;
        private relationshipType;
        private loaded;
        private results;
        constructor();
        setInputName(name: string): void;
        getInputName(): string;
        setContent(content: ContentSummary): void;
        getContent(): ContentSummary;
        setFrom(from: number): void;
        getFrom(): number;
        setSize(size: number): void;
        getSize(): number;
        setContentTypeNames(contentTypeNames: string[]): void;
        setAllowedContentPaths(allowedContentPaths: string[]): void;
        setRelationshipType(relationshipType: string): void;
        setQueryExpr(searchString?: string): void;
        private createSearchExpression(searchString);
        getQueryExpr(): api.query.expr.QueryExpr;
        getRequestPath(): api.rest.Path;
        isPartiallyLoaded(): boolean;
        isLoaded(): boolean;
        resetParams(): void;
        getParams(): Object;
        sendAndParse(): wemQ.Promise<ContentSummary[]>;
        private expandAsString();
    }
}
declare module api.content.resource {
    class SetActiveContentVersionRequest extends ContentResourceRequest<any, any> {
        private versionId;
        private contentId;
        constructor(versionId: string, contentId: ContentId);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentId>;
    }
}
declare module api.content.resource {
    class PublishContentRequest extends ContentResourceRequest<api.task.TaskIdJson, api.task.TaskId> {
        private ids;
        private excludedIds;
        private excludeChildrenIds;
        private publishFrom;
        private publishTo;
        constructor(contentId?: ContentId);
        setIds(contentIds: ContentId[]): PublishContentRequest;
        setExcludedIds(excludedIds: ContentId[]): PublishContentRequest;
        setExcludeChildrenIds(excludeIds: ContentId[]): PublishContentRequest;
        addId(contentId: ContentId): PublishContentRequest;
        setPublishFrom(publishFrom: Date): void;
        setPublishTo(publishTo: Date): void;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<api.task.TaskId>;
    }
}
declare module api.content.resource {
    class UnpublishContentRequest extends ContentResourceRequest<api.task.TaskIdJson, api.task.TaskId> {
        private ids;
        private includeChildren;
        constructor(contentId?: ContentId);
        setIds(contentIds: ContentId[]): UnpublishContentRequest;
        addId(contentId: ContentId): UnpublishContentRequest;
        setIncludeChildren(include: boolean): UnpublishContentRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<api.task.TaskId>;
    }
}
declare module api.content.resource {
    import ResolvePublishContentResultJson = api.content.json.ResolvePublishContentResultJson;
    import ResolvePublishDependenciesResult = api.content.resource.result.ResolvePublishDependenciesResult;
    class ResolvePublishDependenciesRequest extends ContentResourceRequest<ResolvePublishContentResultJson, ResolvePublishDependenciesResult> {
        private ids;
        private excludedIds;
        private excludeChildrenIds;
        constructor(builder: ResolvePublishDependenciesRequestBuilder);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ResolvePublishDependenciesResult>;
        static create(): ResolvePublishDependenciesRequestBuilder;
    }
    class ResolvePublishDependenciesRequestBuilder {
        ids: ContentId[];
        excludedIds: ContentId[];
        excludeChildrenIds: ContentId[];
        setIds(value: ContentId[]): ResolvePublishDependenciesRequestBuilder;
        setExcludedIds(value: ContentId[]): ResolvePublishDependenciesRequestBuilder;
        setExcludeChildrenIds(value: ContentId[]): ResolvePublishDependenciesRequestBuilder;
        build(): ResolvePublishDependenciesRequest;
    }
}
declare module api.content.resource {
    import CompareContentResults = api.content.resource.result.CompareContentResults;
    class CompareContentRequest extends ContentResourceRequest<api.content.json.CompareContentResultsJson, CompareContentResults> {
        private ids;
        constructor(ids: string[]);
        static fromContentSummaries(contentSummaries: ContentSummary[]): CompareContentRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<CompareContentResults>;
        fromJsonToCompareResults(json: api.content.json.CompareContentResultsJson): CompareContentResults;
    }
}
declare module api.content.resource {
    import GetPublishStatusesResult = api.content.resource.result.GetPublishStatusesResult;
    import GetPublishStatusesResultJson = api.content.json.GetPublishStatusesResultJson;
    class GetPublishStatusesRequest extends ContentResourceRequest<GetPublishStatusesResultJson, GetPublishStatusesResult> {
        private ids;
        constructor(ids: string[]);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<GetPublishStatusesResult>;
        fromJsonToGetPublishStatusesResult(json: api.content.json.GetPublishStatusesResultJson): GetPublishStatusesResult;
    }
}
declare module api.content.resource {
    import ContentResponse = api.content.resource.result.ContentResponse;
    class ContentSummaryFetcher {
        static fetchChildren(parentContentId: ContentId, from?: number, size?: number, childOrder?: api.content.order.ChildOrder): wemQ.Promise<ContentResponse<ContentSummary>>;
        static fetch(contentId: ContentId): wemQ.Promise<Content>;
        static fetchByIds(ids: ContentId[]): wemQ.Promise<ContentSummary[]>;
        static getReadOnly(contents: ContentSummary[]): wemQ.Promise<string[]>;
    }
}
declare module api.content.resource {
    import ContentResponse = api.content.resource.result.ContentResponse;
    import CompareContentResults = api.content.resource.result.CompareContentResults;
    class ContentSummaryAndCompareStatusFetcher {
        static fetchChildren(parentContentId: ContentId, from?: number, size?: number, childOrder?: api.content.order.ChildOrder): wemQ.Promise<ContentResponse<ContentSummaryAndCompareStatus>>;
        static fetch(contentId: ContentId): wemQ.Promise<ContentSummaryAndCompareStatus>;
        static fetchByContent(content: Content): wemQ.Promise<ContentSummaryAndCompareStatus>;
        static fetchByPaths(paths: ContentPath[]): wemQ.Promise<ContentSummaryAndCompareStatus[]>;
        static fetchByIds(ids: ContentId[]): wemQ.Promise<ContentSummaryAndCompareStatus[]>;
        static fetchStatus(contentSummaries: ContentSummary[]): wemQ.Promise<ContentSummaryAndCompareStatus[]>;
        static fetchChildrenIds(parentContentId: ContentId): wemQ.Promise<ContentId[]>;
        static updateCompareStatus(contentSummaries: ContentSummary[], compareResults: CompareContentResults): ContentSummaryAndCompareStatus[];
        static updateReadOnly(contents: ContentSummaryAndCompareStatus[]): wemQ.Promise<any>;
    }
}
declare module api.content.resource {
    import GetActiveContentVersionsResultsJson = api.content.json.GetActiveContentVersionsResultsJson;
    class GetActiveContentVersionsRequest extends ContentResourceRequest<GetActiveContentVersionsResultsJson, ContentVersion[]> {
        private id;
        constructor(id: ContentId);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentVersion[]>;
        private fromJsonToContentVersions(json);
    }
}
declare module api.content.resource {
    import GetContentVersionsResultsJson = api.content.json.GetContentVersionsResultsJson;
    class GetContentVersionsRequest extends ContentResourceRequest<GetContentVersionsResultsJson, ContentVersion[]> {
        private contentId;
        private from;
        private size;
        constructor(contentId: ContentId);
        setFrom(from: number): GetContentVersionsRequest;
        setSize(size: number): GetContentVersionsRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentVersion[]>;
        private fromJsonToContentVersions(json);
    }
}
declare module api.content.resource {
    import GetContentVersionsForViewResultsJson = api.content.json.GetContentVersionsForViewResultsJson;
    class GetContentVersionsForViewRequest extends ContentResourceRequest<GetContentVersionsForViewResultsJson, ContentVersions> {
        private contentId;
        private from;
        private size;
        constructor(contentId: ContentId);
        setFrom(from: number): GetContentVersionsForViewRequest;
        setSize(size: number): GetContentVersionsForViewRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentVersions>;
    }
}
declare module api.content.resource {
    class GetNearestSiteRequest extends ContentResourceRequest<api.content.json.ContentJson, api.content.site.Site> {
        private contentId;
        constructor(contentId: api.content.ContentId);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<api.content.site.Site>;
    }
}
declare module api.content.resource {
    import ContentsExistJson = api.content.json.ContentsExistJson;
    import ContentsExistResult = api.content.resource.result.ContentsExistResult;
    class ContentsExistRequest extends ContentResourceRequest<ContentsExistJson, ContentsExistResult> {
        private contentIds;
        constructor(contentIds: string[]);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentsExistResult>;
    }
}
declare module api.content.resource {
    class WidgetDescriptorResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourcePath;
        constructor();
        getResourcePath(): api.rest.Path;
        static fromJson(json: api.content.json.WidgetDescriptorJson[]): Widget[];
    }
}
declare module api.content.resource {
    class GetWidgetsByInterfaceRequest extends WidgetDescriptorResourceRequest<api.content.json.WidgetDescriptorJson[], any> {
        private widgetInterfaces;
        constructor(widgetInterfaces: string[]);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Widget[]>;
    }
}
declare module api.content.resource {
    import ContentDependencyJson = api.content.json.ContentDependencyJson;
    class ResolveDependenciesRequest extends ContentResourceRequest<ContentDependencyJson, any> {
        private id;
        constructor(contentId: ContentId);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
    }
}
declare module api.content.resource {
    class GetDescendantsOfContentsRequest extends ContentResourceRequest<api.content.json.ContentIdBaseItemJson[], ContentId[]> {
        private contentPaths;
        private filterStatuses;
        static LOAD_SIZE: number;
        constructor(contentPath?: ContentPath);
        setContentPaths(contentPaths: ContentPath[]): GetDescendantsOfContentsRequest;
        setFilterStatuses(filterStatuses: CompareStatus[]): GetDescendantsOfContentsRequest;
        addContentPath(contentPath: ContentPath): GetDescendantsOfContentsRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentId[]>;
    }
}
declare module api.content.resource {
    import EffectivePermissionJson = api.content.json.EffectivePermissionJson;
    import EffectivePermission = api.ui.security.acl.EffectivePermission;
    class GetEffectivePermissionsRequest extends ContentResourceRequest<EffectivePermissionJson[], EffectivePermission[]> {
        private contentId;
        constructor(contentId: ContentId);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<api.ui.security.acl.EffectivePermission[]>;
    }
}
declare module api.content.resource {
    class GetContentIdsByParentRequest extends ContentResourceRequest<any, any> {
        private parentId;
        private order;
        constructor();
        setOrder(value: api.content.order.ChildOrder): GetContentIdsByParentRequest;
        setParentId(value: ContentId): GetContentIdsByParentRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<ContentId[]>;
    }
}
declare module api.content.resource {
    import UndoPendingDeleteContentResultJson = api.content.json.UndoPendingDeleteContentResultJson;
    class UndoPendingDeleteContentRequest extends ContentResourceRequest<UndoPendingDeleteContentResultJson, number> {
        private ids;
        constructor(ids: ContentId[]);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<number>;
        static showResponse(result: number): void;
    }
}
declare module api.content.resource {
    import HasUnpublishedChildrenListJson = api.content.json.HasUnpublishedChildrenListJson;
    import HasUnpublishedChildrenResult = api.content.resource.result.HasUnpublishedChildrenResult;
    class HasUnpublishedChildrenRequest extends ContentResourceRequest<HasUnpublishedChildrenListJson, HasUnpublishedChildrenResult> {
        private ids;
        constructor(ids: ContentId[]);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<HasUnpublishedChildrenResult>;
    }
}
declare module api.content {
    import OptionDataLoader = api.ui.selector.OptionDataLoader;
    import TreeNode = api.ui.treegrid.TreeNode;
    import OptionDataLoaderData = api.ui.selector.OptionDataLoaderData;
    import Option = api.ui.selector.Option;
    import ContentTreeSelectorItem = api.content.resource.ContentTreeSelectorItem;
    class ContentSummaryOptionDataLoader implements OptionDataLoader<ContentTreeSelectorItem> {
        private request;
        private contentTypeNames;
        private allowedContentPaths;
        private relationshipType;
        constructor(builder?: ContentSummaryOptionDataLoaderBuilder);
        private initRequest(builder);
        fetch(node: TreeNode<Option<ContentTreeSelectorItem>>): wemQ.Promise<ContentTreeSelectorItem>;
        fetchChildren(parentNode: TreeNode<Option<ContentTreeSelectorItem>>, from?: number, size?: number): wemQ.Promise<OptionDataLoaderData<ContentTreeSelectorItem>>;
        protected createOptionData(data: ContentTreeSelectorItem[]): OptionDataLoaderData<ContentTreeSelectorItem>;
        checkReadonly(items: ContentTreeSelectorItem[]): wemQ.Promise<string[]>;
        static create(): ContentSummaryOptionDataLoaderBuilder;
    }
    class ContentSummaryOptionDataLoaderBuilder {
        content: ContentSummary;
        contentTypeNames: string[];
        allowedContentPaths: string[];
        relationshipType: string;
        setContentTypeNames(contentTypeNames: string[]): ContentSummaryOptionDataLoaderBuilder;
        setAllowedContentPaths(allowedContentPaths: string[]): ContentSummaryOptionDataLoaderBuilder;
        setRelationshipType(relationshipType: string): ContentSummaryOptionDataLoaderBuilder;
        setContent(content: ContentSummary): ContentSummaryOptionDataLoaderBuilder;
        build(): ContentSummaryOptionDataLoader;
    }
}
declare module api.content {
    import OptionDataHelper = api.ui.selector.OptionDataHelper;
    import ContentTreeSelectorItem = api.content.resource.ContentTreeSelectorItem;
    class ContentSummaryOptionDataHelper implements OptionDataHelper<ContentTreeSelectorItem> {
        hasChildren(data: ContentTreeSelectorItem): boolean;
        getDataId(data: ContentTreeSelectorItem): string;
        isDescendingPath(childOption: ContentTreeSelectorItem, parentOption: ContentTreeSelectorItem): boolean;
        isDisabled(data: ContentTreeSelectorItem): boolean;
    }
}
declare module api.content {
    class ContentId implements api.Equitable {
        private value;
        constructor(value: string);
        toString(): string;
        equals(o: api.Equitable): boolean;
        static isValidContentId(id: string): boolean;
        static fromReference(reference: api.util.Reference): ContentId;
    }
}
declare module api.content {
    class ContentIds implements api.Equitable {
        private array;
        constructor(array: ContentId[]);
        length(): number;
        map<U>(callbackfn: (value: ContentId, index?: number) => U): U[];
        contains(contentId: ContentId): boolean;
        slice(from: number, to: number): ContentId[];
        static empty(): ContentIds;
        static from(contentIds: ContentId[]): ContentIds;
        static fromContents(contents: ContentSummary[]): ContentIds;
        equals(o: api.Equitable): boolean;
        static create(): ContentIdsBuilder;
    }
    class ContentIdsBuilder {
        array: ContentId[];
        fromStrings(values: string[]): ContentIdsBuilder;
        fromContentIds(contentIds: ContentId[]): ContentIdsBuilder;
        addContentId(value: ContentId): ContentIdsBuilder;
        build(): ContentIds;
    }
}
declare module api.content {
    class ContentName extends api.Name implements api.Equitable {
        static UNNAMED_PREFIX: string;
        constructor(name: string);
        isUnnamed(): boolean;
        toUnnamed(): ContentUnnamed;
        equals(o: api.Equitable): boolean;
        toStringIncludingHidden(): string;
        static fromString(str: string): ContentName;
    }
}
declare module api.content {
    class ContentUnnamed extends ContentName implements api.Equitable {
        static PRETTY_UNNAMED: string;
        constructor(name: string);
        isUnnamed(): boolean;
        toString(): string;
        equals(o: api.Equitable): boolean;
        static newUnnamed(): ContentUnnamed;
        static prettifyUnnamed(name?: string): string;
    }
}
declare module api.content {
    class ContentPath implements api.Equitable {
        static ELEMENT_DIVIDER: string;
        static ROOT: ContentPath;
        private elements;
        private refString;
        static fromParent(parent: ContentPath, name: string): ContentPath;
        static fromString(path: string): ContentPath;
        constructor(elements: string[]);
        getPathAtLevel(level: number): ContentPath;
        getElements(): string[];
        getName(): string;
        getLevel(): number;
        hasParentContent(): boolean;
        getFirstElement(): string;
        getParentPath(): ContentPath;
        isRoot(): boolean;
        isNotRoot(): boolean;
        equals(o: api.Equitable): boolean;
        isDescendantOf(path: ContentPath): boolean;
        isChildOf(path: ContentPath): boolean;
        prettifyUnnamedPathElements(): ContentPath;
        toString(): string;
    }
}
declare module api.content {
    class ContentIdBaseItem implements api.Equitable {
        private contentId;
        constructor(builder: ContentIdBaseItemBuilder);
        getContentId(): ContentId;
        equals(o: api.Equitable): boolean;
        static fromJson(json: json.ContentIdBaseItemJson): ContentIdBaseItem;
        static fromJsonArray(jsonArray: json.ContentIdBaseItemJson[]): ContentIdBaseItem[];
    }
    class ContentIdBaseItemBuilder {
        contentId: ContentId;
        constructor(source?: ContentIdBaseItem);
        fromContentIdBaseItemJson(json: json.ContentIdBaseItemJson): ContentIdBaseItemBuilder;
        build(): ContentIdBaseItem;
    }
}
declare module api.content {
    import Thumbnail = api.thumb.Thumbnail;
    import ContentState = api.schema.content.ContentState;
    class ContentSummary extends ContentIdBaseItem {
        private id;
        private name;
        private displayName;
        private path;
        private root;
        private children;
        private type;
        private iconUrl;
        private thumbnail;
        private modifier;
        private owner;
        private page;
        private valid;
        private requireValid;
        private createdTime;
        private modifiedTime;
        private publishFirstTime;
        private publishFromTime;
        private publishToTime;
        private deletable;
        private editable;
        private childOrder;
        private language;
        private contentState;
        constructor(builder: ContentSummaryBuilder);
        getName(): ContentName;
        getDisplayName(): string;
        hasParent(): boolean;
        getPath(): ContentPath;
        isRoot(): boolean;
        hasChildren(): boolean;
        getType(): api.schema.content.ContentTypeName;
        getIconUrl(): string;
        hasThumbnail(): boolean;
        getThumbnail(): Thumbnail;
        getOwner(): api.security.PrincipalKey;
        getModifier(): string;
        isSite(): boolean;
        isPage(): boolean;
        isPageTemplate(): boolean;
        isImage(): boolean;
        isValid(): boolean;
        isRequireValid(): boolean;
        getId(): string;
        getCreatedTime(): Date;
        getModifiedTime(): Date;
        getPublishFirstTime(): Date;
        getPublishFromTime(): Date;
        getPublishToTime(): Date;
        isDeletable(): boolean;
        isEditable(): boolean;
        getChildOrder(): api.content.order.ChildOrder;
        getLanguage(): string;
        getContentState(): ContentState;
        equals(o: api.Equitable): boolean;
        static fromJson(json: api.content.json.ContentSummaryJson): ContentSummary;
        static fromJsonArray(jsonArray: api.content.json.ContentSummaryJson[]): ContentSummary[];
    }
    class ContentSummaryBuilder extends ContentIdBaseItemBuilder {
        id: string;
        name: ContentName;
        displayName: string;
        path: ContentPath;
        root: boolean;
        children: boolean;
        type: api.schema.content.ContentTypeName;
        iconUrl: string;
        thumbnail: Thumbnail;
        modifier: string;
        owner: api.security.PrincipalKey;
        page: boolean;
        valid: boolean;
        requireValid: boolean;
        createdTime: Date;
        modifiedTime: Date;
        publishFirstTime: Date;
        publishFromTime: Date;
        publishToTime: Date;
        deletable: boolean;
        editable: boolean;
        childOrder: api.content.order.ChildOrder;
        language: string;
        contentState: ContentState;
        constructor(source?: ContentSummary);
        fromContentSummaryJson(json: api.content.json.ContentSummaryJson): ContentSummaryBuilder;
        setId(value: string): ContentSummaryBuilder;
        setContentId(value: ContentId): ContentSummaryBuilder;
        setIconUrl(value: string): ContentSummaryBuilder;
        setContentState(value: ContentState): ContentSummaryBuilder;
        setValid(value: boolean): ContentSummaryBuilder;
        setRequireValid(value: boolean): ContentSummaryBuilder;
        setName(value: ContentName): ContentSummaryBuilder;
        setPath(path: ContentPath): ContentSummaryBuilder;
        setType(value: api.schema.content.ContentTypeName): ContentSummaryBuilder;
        setDisplayName(value: string): ContentSummaryBuilder;
        setHasChildren(value: boolean): ContentSummaryBuilder;
        setDeletable(value: boolean): ContentSummaryBuilder;
        setPublishFromTime(value: Date): ContentSummaryBuilder;
        setPublishToTime(value: Date): ContentSummaryBuilder;
        setPublishFirstTime(value: Date): ContentSummaryBuilder;
        build(): ContentSummary;
    }
}
declare module api.content {
    class ContentSummaryViewer extends api.ui.NamesAndIconViewer<ContentSummary> {
        constructor();
        resolveDisplayName(object: ContentSummary): string;
        resolveUnnamedDisplayName(object: ContentSummary): string;
        resolveSubName(object: ContentSummary, relativePath?: boolean): string;
        resolveSubTitle(object: ContentSummary): string;
        resolveIconUrl(object: ContentSummary): string;
    }
}
declare module api.content {
    class ContentMetadata implements api.Equitable {
        private hits;
        private totalHits;
        constructor(hits: number, totalHits: number);
        getHits(): number;
        getTotalHits(): number;
        setHits(hits: number): void;
        setTotalHits(totalHits: number): void;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.content {
    import AccessControlList = api.security.acl.AccessControlList;
    import Property = api.data.Property;
    import PropertyTree = api.data.PropertyTree;
    class Content extends ContentSummary implements api.Equitable, api.Cloneable {
        private data;
        private attachments;
        private extraData;
        private pageObj;
        private permissions;
        private inheritPermissions;
        private overwritePermissions;
        constructor(builder: ContentBuilder);
        getContentData(): PropertyTree;
        getAttachments(): api.content.attachment.Attachments;
        getExtraData(name: api.schema.mixin.MixinName): ExtraData;
        getAllExtraData(): ExtraData[];
        getProperty(propertyName: string): Property;
        getPage(): api.content.page.Page;
        getPermissions(): AccessControlList;
        isInheritPermissionsEnabled(): boolean;
        isOverwritePermissionsEnabled(): boolean;
        isAnyPrincipalAllowed(principalKeys: api.security.PrincipalKey[], permission: api.security.acl.Permission): boolean;
        private trimPropertyTree(data);
        private trimExtraData(extraData);
        containsChildContentId(contentId: ContentId): wemQ.Promise<boolean>;
        dataEquals(other: PropertyTree, ignoreEmptyValues?: boolean): boolean;
        extraDataEquals(other: ExtraData[], ignoreEmptyValues?: boolean): boolean;
        equals(o: api.Equitable, ignoreEmptyValues?: boolean, shallow?: boolean): boolean;
        clone(): Content;
        newBuilder(): ContentBuilder;
        static fromJson(json: api.content.json.ContentJson): Content;
        static fromJsonArray(jsonArray: api.content.json.ContentJson[]): Content[];
    }
    class ContentBuilder extends ContentSummaryBuilder {
        data: PropertyTree;
        attachments: api.content.attachment.Attachments;
        extraData: ExtraData[];
        pageObj: api.content.page.Page;
        permissions: AccessControlList;
        inheritPermissions: boolean;
        overwritePermissions: boolean;
        constructor(source?: Content);
        fromContentJson(json: api.content.json.ContentJson): ContentBuilder;
        setData(value: PropertyTree): ContentBuilder;
        setAttachments(value: api.content.attachment.Attachments): ContentBuilder;
        setPage(value: api.content.page.Page): ContentBuilder;
        setExtraData(extraData: ExtraData[]): ContentBuilder;
        setPermissions(value: AccessControlList): ContentBuilder;
        setInheritPermissionsEnabled(value: boolean): ContentBuilder;
        setOverwritePermissionsEnabled(value: boolean): ContentBuilder;
        build(): Content;
    }
}
declare module api.content {
    import MixinName = api.schema.mixin.MixinName;
    import PropertyTree = api.data.PropertyTree;
    class ExtraData implements api.Cloneable, api.Equitable {
        private name;
        private data;
        constructor(name: MixinName, data: PropertyTree);
        getName(): MixinName;
        getData(): PropertyTree;
        clone(): ExtraData;
        equals(o: api.Equitable): boolean;
        toJson(): api.content.json.ExtraDataJson;
        static fromJson(metadataJson: api.content.json.ExtraDataJson): ExtraData;
    }
}
declare module api.content {
    import SelectedOption = api.ui.selector.combobox.SelectedOption;
    import RichComboBox = api.ui.selector.combobox.RichComboBox;
    import RichComboBoxBuilder = api.ui.selector.combobox.RichComboBoxBuilder;
    import ContentSummaryLoader = api.content.resource.ContentSummaryLoader;
    import ContentQueryResultJson = api.content.json.ContentQueryResultJson;
    import ContentSummaryJson = api.content.json.ContentSummaryJson;
    import OptionDataLoader = api.ui.selector.OptionDataLoader;
    import ContentTreeSelectorItem = api.content.resource.ContentTreeSelectorItem;
    class ContentComboBox extends RichComboBox<ContentSummary> {
        constructor(builder: ContentComboBoxBuilder);
        getLoader(): ContentSummaryLoader;
        getContent(contentId: ContentId): ContentSummary;
        setContent(content: ContentSummary): void;
        static create(): ContentComboBoxBuilder;
    }
    class ContentSelectedOptionsView extends api.ui.selector.combobox.BaseSelectedOptionsView<ContentSummary> {
        createSelectedOption(option: api.ui.selector.Option<ContentSummary>): SelectedOption<ContentSummary>;
    }
    class MissingContentSelectedOptionView extends api.ui.selector.combobox.BaseSelectedOptionView<ContentSummary> {
        private id;
        constructor(option: api.ui.selector.Option<ContentSummary>);
        doRender(): wemQ.Promise<boolean>;
    }
    class ContentSelectedOptionView extends api.ui.selector.combobox.RichSelectedOptionView<ContentSummary> {
        constructor(option: api.ui.selector.Option<ContentSummary>);
        resolveIconUrl(content: ContentSummary): string;
        resolveTitle(content: ContentSummary): string;
        resolveSubTitle(content: ContentSummary): string;
        protected createEditButton(content: api.content.ContentSummary): api.dom.AEl;
    }
    class ContentComboBoxBuilder extends RichComboBoxBuilder<ContentSummary> {
        name: string;
        maximumOccurrences: number;
        loader: api.util.loader.BaseLoader<ContentQueryResultJson<ContentSummaryJson>, ContentSummary>;
        minWidth: number;
        value: string;
        displayMissingSelectedOptions: boolean;
        removeMissingSelectedOptions: boolean;
        setName(value: string): ContentComboBoxBuilder;
        setMaximumOccurrences(maximumOccurrences: number): ContentComboBoxBuilder;
        setLoader(loader: api.util.loader.BaseLoader<ContentQueryResultJson<ContentSummaryJson>, ContentSummary>): ContentComboBoxBuilder;
        setMinWidth(value: number): ContentComboBoxBuilder;
        setValue(value: string): ContentComboBoxBuilder;
        setDisplayMissingSelectedOptions(value: boolean): ContentComboBoxBuilder;
        setRemoveMissingSelectedOptions(value: boolean): ContentComboBoxBuilder;
        setTreegridDropdownEnabled(value: boolean): ContentComboBoxBuilder;
        setOptionDataLoader(value: OptionDataLoader<ContentTreeSelectorItem>): ContentComboBoxBuilder;
        build(): ContentComboBox;
    }
}
declare module api.content {
    enum CompareStatus {
        NEW = 0,
        NEW_TARGET = 1,
        NEWER = 2,
        OLDER = 3,
        PENDING_DELETE = 4,
        PENDING_DELETE_TARGET = 5,
        EQUAL = 6,
        MOVED = 7,
        CONFLICT_PATH_EXISTS = 8,
        CONFLICT_VERSION_BRANCH_DIVERGS = 9,
        UNKNOWN = 10,
    }
    class CompareStatusFormatter {
        static formatStatusFromContent(content: ContentSummaryAndCompareStatus): string;
        static formatStatus(compareStatus: CompareStatus, content?: ContentSummary): string;
    }
    class CompareStatusChecker {
        static isPendingDelete(compareStatus: CompareStatus): boolean;
        static isPublished(compareStatus: CompareStatus): boolean;
        static isOnline(compareStatus: CompareStatus): boolean;
        static isNew(compareStatus: CompareStatus): boolean;
    }
}
declare module api.content {
    enum PublishStatus {
        ONLINE = 0,
        PENDING = 1,
        EXPIRED = 2,
    }
    class PublishStatusFormatter {
        static formatStatus(publishStatus: PublishStatus): string;
    }
}
declare module api.content {
    enum Branch {
        DRAFT = 0,
        MASTER = 1,
    }
}
declare module api.content {
    import UploadItem = api.ui.uploader.UploadItem;
    class ContentSummaryAndCompareStatus implements api.Equitable {
        private uploadItem;
        private contentSummary;
        private compareStatus;
        private publishStatus;
        private readOnly;
        static fromContentSummary(contentSummary: ContentSummary): ContentSummaryAndCompareStatus;
        static fromContentAndCompareStatus(contentSummary: ContentSummary, compareStatus: CompareStatus): ContentSummaryAndCompareStatus;
        static fromContentAndCompareAndPublishStatus(contentSummary: ContentSummary, compareStatus: CompareStatus, publishStatus: PublishStatus): ContentSummaryAndCompareStatus;
        static fromUploadItem(item: UploadItem<ContentSummary>): ContentSummaryAndCompareStatus;
        getContentSummary(): ContentSummary;
        setContentSummary(contentSummary: ContentSummary): ContentSummaryAndCompareStatus;
        getCompareStatus(): CompareStatus;
        setCompareStatus(status: CompareStatus): ContentSummaryAndCompareStatus;
        getPublishStatus(): PublishStatus;
        setPublishStatus(publishStatus: PublishStatus): ContentSummaryAndCompareStatus;
        getUploadItem(): UploadItem<ContentSummary>;
        setUploadItem(item: UploadItem<ContentSummary>): ContentSummaryAndCompareStatus;
        getContentId(): ContentId;
        getId(): string;
        getPath(): ContentPath;
        getType(): api.schema.content.ContentTypeName;
        getDisplayName(): string;
        getIconUrl(): string;
        hasChildren(): boolean;
        equals(o: api.Equitable): boolean;
        setReadOnly(value: boolean): void;
        isReadOnly(): boolean;
        isPendingDelete(): boolean;
        isPublished(): boolean;
        isOnline(): boolean;
        isNew(): boolean;
    }
}
declare module api.content {
    class ContentSummaryAndCompareStatusViewer extends api.ui.NamesAndIconViewer<ContentSummaryAndCompareStatus> {
        constructor();
        resolveDisplayName(object: ContentSummaryAndCompareStatus): string;
        resolveUnnamedDisplayName(object: ContentSummaryAndCompareStatus): string;
        resolveSubName(object: ContentSummaryAndCompareStatus, relativePath?: boolean): string;
        resolveSubTitle(object: ContentSummaryAndCompareStatus): string;
        resolveIconClass(object: ContentSummaryAndCompareStatus): string;
        resolveIconUrl(object: ContentSummaryAndCompareStatus): string;
    }
}
declare module api.content {
    class ContentVersion {
        modifier: string;
        modifierDisplayName: string;
        displayName: string;
        modified: Date;
        comment: string;
        id: string;
        workspaces: string[];
        static fromJson(contentVersionJson: api.content.json.ContentVersionJson, workspaces?: string[]): ContentVersion;
    }
}
declare module api.content {
    class ContentVersions {
        private contentVersions;
        private activeVersion;
        getContentVersions(): ContentVersion[];
        getActiveVersion(): ContentVersion;
        constructor(contentVersions: ContentVersion[], activeVersion: ContentVersion);
        static fromJson(contentVersionForViewJson: api.content.json.GetContentVersionsForViewResultsJson): ContentVersions;
    }
}
declare module api.content {
    import ApplicationKey = api.application.ApplicationKey;
    class Widget {
        private url;
        private displayName;
        private interfaces;
        private widgetDescriptorKey;
        private config;
        constructor(url: string, displayName: string, interfaces: string[], key: string, config: {
            [key: string]: string;
        });
        private makeWidgetDescriptorKey(key);
        getUrl(): string;
        getDisplayName(): string;
        getInterfaces(): string[];
        getWidgetDescriptorKey(): api.content.WidgetDescriptorKey;
        getConfig(): {
            [key: string]: string;
        };
    }
    class WidgetDescriptorKey implements api.Equitable {
        private static SEPARATOR;
        private applicationKey;
        private name;
        private refString;
        static fromString(str: string): WidgetDescriptorKey;
        constructor(applicationKey: ApplicationKey, name: string);
        getApplicationKey(): ApplicationKey;
        getName(): string;
        toString(): string;
        equals(o: api.Equitable): boolean;
    }
}
import UriHelper = api.util.UriHelper;
declare module api.content.util {
    class ContentIconUrlResolver extends api.icon.IconUrlResolver {
        private content;
        private crop;
        private size;
        setContent(value: ContentSummary): ContentIconUrlResolver;
        setSize(value: number): ContentIconUrlResolver;
        setCrop(value: boolean): ContentIconUrlResolver;
        resolve(): string;
        static default(): string;
    }
}
declare module api.content.util {
    class ContentImageUrlResolver extends api.icon.IconUrlResolver {
        private contentId;
        private size;
        private ts;
        private scaleWidth;
        private source;
        private scale;
        setContentId(value: ContentId): ContentImageUrlResolver;
        setSize(value: number): ContentImageUrlResolver;
        setTimestamp(value: Date): ContentImageUrlResolver;
        setScaleWidth(value: boolean): ContentImageUrlResolver;
        setSource(value: boolean): ContentImageUrlResolver;
        setScale(value: string): ContentImageUrlResolver;
        resolve(): string;
    }
}
declare module api.content.util {
    class ContentByPathComparator implements api.Comparator<ContentSummary> {
        compare(a: ContentSummary, b: ContentSummary): number;
    }
}
declare module api.content.util {
    import TreeNode = api.ui.treegrid.TreeNode;
    class ContentNodeByDisplayNameComparator implements api.Comparator<TreeNode<ContentSummaryAndCompareStatus>> {
        compare(a: TreeNode<ContentSummaryAndCompareStatus>, b: TreeNode<ContentSummaryAndCompareStatus>): number;
    }
}
declare module api.content.util {
    import TreeNode = api.ui.treegrid.TreeNode;
    class ContentNodeByModifiedTimeComparator implements api.Comparator<TreeNode<ContentSummaryAndCompareStatus>> {
        compare(a: TreeNode<ContentSummaryAndCompareStatus>, b: TreeNode<ContentSummaryAndCompareStatus>): number;
    }
}
declare module api.content.util {
    import ApplicationKey = api.application.ApplicationKey;
    import ContentTypeSummary = api.schema.content.ContentTypeSummary;
    class CreateContentFilter {
        private siteApplicationsAllowed;
        constructor();
        siteApplicationsFilter(siteApplicationKeys: ApplicationKey[]): CreateContentFilter;
        isCreateContentAllowed(parentContent: ContentSummary, contentType: ContentTypeSummary): boolean;
    }
}
declare module api.content.util {
    class ExtraDataByMixinNameComparator implements api.Comparator<ExtraData> {
        compare(a: ExtraData, b: ExtraData): number;
    }
}
declare module api.content.order {
    import ReorderChildContentJson = api.content.json.ReorderChildContentJson;
    class OrderChildMovement {
        private contentId;
        private moveBefore;
        constructor(id: ContentId, moveBeforeId: ContentId);
        getContentId(): ContentId;
        getMoveBefore(): ContentId;
        toJson(): ReorderChildContentJson;
    }
}
declare module api.content.order {
    import ReorderChildContentJson = api.content.json.ReorderChildContentJson;
    class OrderChildMovements {
        private reorderChildren;
        getReorderChildren(): OrderChildMovement[];
        addChildMovement(movement: OrderChildMovement): void;
        toArrayJson(): ReorderChildContentJson[];
    }
}
declare module api.content.order {
    import OrderExprJson = api.content.json.OrderExprJson;
    import OrderExprWrapperJson = api.content.json.OrderExprWrapperJson;
    class OrderExpr implements api.Equitable {
        private direction;
        constructor(builder: OrderExprBuilder);
        getDirection(): string;
        toJson(): OrderExprJson;
        toString(): string;
        static toArrayJson(expressions: OrderExpr[]): OrderExprWrapperJson[];
        equals(o: api.Equitable): boolean;
    }
    class OrderExprBuilder {
        direction: string;
        constructor(json?: json.OrderExprJson);
        setDirection(value: string): OrderExprBuilder;
        build(): OrderExpr;
    }
}
declare module api.content.order {
    class DynamicOrderExpr extends OrderExpr {
        private function;
        constructor(builder: DynamicOrderExprBuilder);
        getFunction(): string;
        toString(): string;
        toJson(): json.OrderExprJson;
    }
    class DynamicOrderExprBuilder extends OrderExprBuilder {
        function: string;
        constructor(json: json.OrderExprJson);
        setFunction(value: string): DynamicOrderExprBuilder;
        build(): DynamicOrderExpr;
    }
}
declare module api.content.order {
    class FieldOrderExpr extends OrderExpr {
        private fieldName;
        constructor(builder: FieldOrderExprBuilder);
        getFieldName(): string;
        toJson(): json.OrderExprJson;
        toString(): string;
        equals(o: api.Equitable): boolean;
    }
    class FieldOrderExprBuilder extends OrderExprBuilder {
        fieldName: string;
        constructor(json?: json.OrderExprJson);
        setFieldName(value: string): FieldOrderExprBuilder;
        build(): FieldOrderExpr;
    }
}
declare module api.content.order {
    import ChildOrderJson = api.content.json.ChildOrderJson;
    class ChildOrder implements api.Equitable {
        private DEFAULT_ORDER_DIRECTION_VALUE;
        static DEFAULT_ORDER_FIELD_VALUE: string;
        static ASC_ORDER_DIRECTION_VALUE: string;
        static DESC_ORDER_DIRECTION_VALUE: string;
        static MANUAL_ORDER_VALUE_KEY: string;
        private orderExpressions;
        getOrderExpressions(): OrderExpr[];
        addOrderExpr(expr: OrderExpr): void;
        addOrderExpressions(expressions: OrderExpr[]): void;
        static fromJson(childOrderJson: ChildOrderJson): ChildOrder;
        isManual(): boolean;
        isDesc(): boolean;
        isDefault(): boolean;
        toJson(): api.content.json.ChildOrderJson;
        toString(): string;
        equals(o: api.Equitable): boolean;
        static toSetChildOrderJson(contentId: ContentId, childOrder: ChildOrder, silent: boolean): api.content.json.SetChildOrderJson;
    }
}
declare module api.content.image {
    import Point = api.ui.image.Point;
    import Rect = api.ui.image.Rect;
    class ImageUploaderEl extends api.ui.uploader.MediaUploaderEl {
        private imageEditors;
        private editModeListeners;
        private focusAutoPositionedListeners;
        private cropAutoPositionedListeners;
        private initialWidth;
        private originalHeight;
        private originalWidth;
        private static SELECTED_CLASS;
        private static STANDOUT_CLASS;
        constructor(config: api.ui.uploader.MediaUploaderElConfig);
        private getSizeValue(content, propertyName);
        setOriginalDimensions(content: api.content.Content): void;
        private getProportionalHeight();
        private togglePlaceholder(flag);
        private createImageEditor(value);
        private resolveImageUrl(value);
        private subscribeImageEditorOnEvents(imageEditor, contentId);
        private positionImageEditor(imageEditor);
        protected getExistingItem(value: string): api.dom.Element;
        protected refreshExistingItem(existingItem: api.dom.Element, value: string): void;
        createResultItem(value: string): api.dom.DivEl;
        private toggleSelected(imageEditor);
        setFocalPoint(focal: Point): void;
        setCrop(crop: Rect): void;
        setZoom(zoom: Rect): void;
        isFocalPointEditMode(): boolean;
        isCropEditMode(): boolean;
        protected isSameValueUpdateAllowed(): boolean;
        onEditModeChanged(listener: (edit: boolean, crop: Rect, zoom: Rect, focus: Point) => void): void;
        unEditModeChanged(listener: (edit: boolean, crop: Rect, zoom: Rect, focus: Point) => void): void;
        private notifyEditModeChanged(edit, crop, zoom, focus);
        onCropAutoPositionedChanged(listener: (auto: boolean) => void): void;
        unCropAutoPositionedChanged(listener: (auto: boolean) => void): void;
        private notifyCropAutoPositionedChanged(auto);
        onFocusAutoPositionedChanged(listener: (auto: boolean) => void): void;
        unFocusAutoPositionedChanged(listener: (auto: boolean) => void): void;
        private notifyFocusAutoPositionedChanged(auto);
    }
}
declare module api.content.image {
    class ImageErrorEvent extends api.event.Event {
        private contentId;
        constructor(contentId: ContentId);
        getContentId(): ContentId;
        static on(handler: (event: ImageErrorEvent) => void): void;
        static un(handler?: (event: ImageErrorEvent) => void): void;
    }
}
declare module api.content.page {
    interface DescriptorJson {
        key: string;
        name: string;
        displayName: string;
        controller: string;
        config: api.form.json.FormJson;
    }
}
declare module api.content.page {
    interface PageDescriptorJson extends DescriptorJson {
        regions: api.content.page.region.RegionsDescriptorJson[];
    }
}
declare module api.content.page {
    interface PageDescriptorsJson {
        descriptors: PageDescriptorJson[];
    }
}
declare module api.content.page {
    interface PageJson {
        controller: string;
        template: string;
        regions: api.content.page.region.RegionJson[];
        fragment: api.content.page.region.ComponentJson;
        config: api.data.PropertyArrayJson[];
        customized: boolean;
    }
}
declare module api.content.page {
    class DescriptorName {
        private name;
        constructor(name: string);
        toString(): string;
    }
}
declare module api.content.page {
    class Descriptor implements api.Cloneable {
        private key;
        private name;
        private displayName;
        private config;
        constructor(builder: DescriptorBuilder);
        getKey(): DescriptorKey;
        getName(): DescriptorName;
        getDisplayName(): string;
        getConfig(): api.form.Form;
        clone(): Descriptor;
    }
    class DescriptorBuilder {
        key: DescriptorKey;
        name: DescriptorName;
        displayName: string;
        config: api.form.Form;
        constructor(source?: Descriptor);
    }
}
declare module api.content.page {
    class DescriptorKey implements api.Equitable {
        private static SEPARATOR;
        private applicationKey;
        private name;
        private refString;
        static fromString(str: string): DescriptorKey;
        constructor(applicationKey: api.application.ApplicationKey, name: DescriptorName);
        getApplicationKey(): api.application.ApplicationKey;
        getName(): DescriptorName;
        toString(): string;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.content.page.region {
    import Option = api.ui.selector.Option;
    import DescriptorKey = api.content.page.DescriptorKey;
    import RichDropdown = api.ui.selector.dropdown.RichDropdown;
    class DescriptorBasedDropdown<DESCRIPTOR extends Descriptor> extends RichDropdown<DESCRIPTOR> {
        protected createOption(descriptor: DESCRIPTOR): Option<DESCRIPTOR>;
        setDescriptor(descriptor: Descriptor): void;
        getDescriptor(descriptorKey: DescriptorKey): DESCRIPTOR;
    }
}
declare module api.content.page {
    class PageDescriptor extends Descriptor implements api.Cloneable {
        private regions;
        constructor(builder: PageDescriptorBuilder);
        getRegions(): region.RegionDescriptor[];
        clone(): PageDescriptor;
    }
    class PageDescriptorBuilder extends DescriptorBuilder {
        regions: region.RegionDescriptor[];
        constructor(source?: PageDescriptor);
        fromJson(json: api.content.page.PageDescriptorJson): PageDescriptorBuilder;
        setKey(key: DescriptorKey): PageDescriptorBuilder;
        setName(value: DescriptorName): PageDescriptorBuilder;
        setDisplayName(value: string): PageDescriptorBuilder;
        setConfig(value: api.form.Form): PageDescriptorBuilder;
        addRegion(value: region.RegionDescriptor): PageDescriptorBuilder;
        build(): PageDescriptor;
    }
}
declare module api.content.page {
    import ApplicationKey = api.application.ApplicationKey;
    import ApplicationBasedCache = api.application.ApplicationBasedCache;
    class PageDescriptorCache extends ApplicationBasedCache<PageDescriptorApplicationCache, PageDescriptor, DescriptorKey> {
        private static instance;
        static get(): PageDescriptorCache;
        constructor();
        loadByApplication(applicationKey: ApplicationKey): void;
        put(descriptor: PageDescriptor): void;
        getByKey(key: DescriptorKey): PageDescriptor;
        createApplicationCache(): PageDescriptorApplicationCache;
    }
    class PageDescriptorApplicationCache extends api.cache.Cache<PageDescriptor, DescriptorKey> {
        copy(object: PageDescriptor): PageDescriptor;
        getKeyFromObject(object: PageDescriptor): DescriptorKey;
        getKeyAsString(key: DescriptorKey): string;
    }
}
declare module api.content.page {
    class PageDescriptorResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourcePath;
        cache: PageDescriptorCache;
        constructor();
        getResourcePath(): api.rest.Path;
        fromJsonToPageDescriptor(json: api.content.page.PageDescriptorJson, ignoreCache?: boolean): PageDescriptor;
        fromJsonToPageDescriptors(json: PageDescriptorsJson): PageDescriptor[];
    }
}
declare module api.content.page {
    class GetPageDescriptorByKeyRequest extends PageDescriptorResourceRequest<PageDescriptorJson, PageDescriptor> {
        private key;
        constructor(key: DescriptorKey);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<PageDescriptor>;
    }
}
declare module api.content.page {
    class GetPageDescriptorsByApplicationRequest extends PageDescriptorResourceRequest<PageDescriptorsJson, PageDescriptor[]> {
        private applicationKey;
        constructor(applicationKey: api.application.ApplicationKey);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<PageDescriptor[]>;
    }
}
declare module api.content.page {
    import ApplicationKey = api.application.ApplicationKey;
    class GetPageDescriptorsByApplicationsRequest extends PageDescriptorResourceRequest<PageDescriptorsJson, PageDescriptor[]> {
        private applicationKeys;
        setApplicationKeys(applicationKeys: ApplicationKey[]): void;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<PageDescriptor[]>;
    }
}
declare module api.content.page {
    import LoadedDataEvent = api.util.loader.event.LoadedDataEvent;
    import LiveEditModel = api.liveedit.LiveEditModel;
    import DescriptorBasedDropdown = api.content.page.region.DescriptorBasedDropdown;
    class PageDescriptorDropdown extends DescriptorBasedDropdown<PageDescriptor> {
        private loadedDataListeners;
        private liveEditModel;
        constructor(model: LiveEditModel);
        load(): void;
        protected createLoader(): PageDescriptorLoader;
        handleLoadedData(event: LoadedDataEvent<PageDescriptor>): void;
        private initListeners();
        protected handleOptionSelected(event: api.ui.selector.OptionSelectedEvent<api.content.page.PageDescriptor>): void;
        onLoadedData(listener: (event: LoadedDataEvent<PageDescriptor>) => void): void;
        unLoadedData(listener: (event: LoadedDataEvent<PageDescriptor>) => void): void;
        private notifyLoadedData(event);
    }
}
declare module api.content.page {
    class PageDescriptorViewer extends api.ui.NamesAndIconViewer<PageDescriptor> {
        constructor();
        resolveDisplayName(object: PageDescriptor): string;
        resolveSubName(object: PageDescriptor, relativePath?: boolean): string;
        resolveIconClass(object: PageDescriptor): string;
    }
}
declare module api.content.page {
    import ApplicationKey = api.application.ApplicationKey;
    class PageDescriptorLoader extends api.util.loader.BaseLoader<PageDescriptorsJson, PageDescriptor> {
        protected request: GetPageDescriptorsByApplicationsRequest;
        constructor();
        filterFn(descriptor: PageDescriptor): boolean;
        protected createRequest(): GetPageDescriptorsByApplicationsRequest;
        setApplicationKeys(applicationKeys: ApplicationKey[]): void;
    }
}
declare module api.content.page {
    class PageTemplateKey extends api.content.ContentId {
        static fromContentId(id: api.content.ContentId): PageTemplateKey;
        static fromString(s: string): PageTemplateKey;
        constructor(s: string);
        equals(o: api.Equitable): boolean;
    }
}
declare module api.content.page {
    class PageTemplateName {
        private name;
        constructor(name: string);
        toString(): string;
    }
}
declare module api.content.page {
    import ContentTypeName = api.schema.content.ContentTypeName;
    import PropertyTree = api.data.PropertyTree;
    class PageTemplate extends api.content.Content implements api.Equitable {
        private canRender;
        constructor(builder: PageTemplateBuilder);
        getKey(): PageTemplateKey;
        getPageMode(): api.content.page.PageMode;
        getController(): DescriptorKey;
        isCanRender(pattern: ContentTypeName): boolean;
        getCanRender(): ContentTypeName[];
        hasRegions(): boolean;
        getRegions(): api.content.page.region.Regions;
        hasConfig(): boolean;
        getConfig(): PropertyTree;
        equals(o: api.Equitable, ignoreEmptyValues?: boolean): boolean;
        clone(): PageTemplate;
        newBuilder(): PageTemplateBuilder;
    }
    class PageTemplateBuilder extends api.content.ContentBuilder {
        constructor(source?: PageTemplate);
        fromContentJson(contentJson: api.content.json.ContentJson): PageTemplateBuilder;
        build(): PageTemplate;
    }
}
declare module api.content.page {
    class PageTemplateViewer extends api.ui.NamesAndIconViewer<PageTemplate> {
        constructor();
        resolveDisplayName(object: PageTemplate): string;
        resolveSubName(object: PageTemplate, relativePath?: boolean): string;
        resolveIconClass(object: PageTemplate): string;
    }
}
declare module api.content.page {
    class PageTemplateComboBox extends api.ui.selector.combobox.RichComboBox<PageTemplate> {
        constructor();
    }
    class PageTemplateSelectedOptionsView extends api.ui.selector.combobox.BaseSelectedOptionsView<PageTemplate> {
        createSelectedOption(option: api.ui.selector.Option<PageTemplate>): api.ui.selector.combobox.SelectedOption<PageTemplate>;
    }
    class PageTemplateSelectedOptionView extends api.ui.selector.combobox.BaseSelectedOptionView<PageTemplate> {
        private pageTemplate;
        constructor(option: api.ui.selector.Option<PageTemplate>);
        doRender(): wemQ.Promise<boolean>;
    }
}
declare module api.content.page {
    import ContentJson = api.content.json.ContentJson;
    import ListContentResult = api.content.resource.result.ListContentResult;
    class PageTemplateLoader extends api.util.loader.BaseLoader<ListContentResult<ContentJson>, PageTemplate> {
        constructor(request: PageTemplateResourceRequest<ListContentResult<ContentJson>, PageTemplate[]>);
        filterFn(template: PageTemplate): boolean;
    }
}
declare module api.content.page {
    class PageTemplateResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourcePath;
        constructor();
        getResourcePath(): api.rest.Path;
        fromJsonToContent(json: api.content.json.ContentJson): PageTemplate;
    }
}
declare module api.content.page {
    import ContentJson = api.content.json.ContentJson;
    class GetPageTemplateByKeyRequest extends PageTemplateResourceRequest<ContentJson, PageTemplate> {
        private pageTemplateKey;
        constructor(pageTemplateKey: PageTemplateKey);
        validate(): void;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<PageTemplate>;
    }
}
declare module api.content.page {
    import ContentJson = api.content.json.ContentJson;
    import ListContentResult = api.content.resource.result.ListContentResult;
    class GetPageTemplatesRequest extends PageTemplateResourceRequest<ListContentResult<ContentJson>, PageTemplate[]> {
        constructor();
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<PageTemplate[]>;
    }
}
declare module api.content.page {
    import ContentJson = api.content.json.ContentJson;
    import ListContentResult = api.content.resource.result.ListContentResult;
    class GetPageTemplatesByCanRenderRequest extends PageTemplateResourceRequest<ListContentResult<ContentJson>, PageTemplate[]> {
        private site;
        private contentTypeName;
        constructor(site: api.content.ContentId, contentTypeName: api.schema.content.ContentTypeName);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<PageTemplate[]>;
    }
}
declare module api.content.page {
    class GetDefaultPageTemplateRequest extends PageTemplateResourceRequest<api.content.json.ContentJson, PageTemplate> {
        private site;
        private contentTypeName;
        constructor(site: api.content.ContentId, contentName: api.schema.content.ContentTypeName);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<PageTemplate>;
    }
}
declare module api.content.page {
    class IsRenderableRequest extends PageTemplateResourceRequest<boolean, boolean> {
        private contentId;
        constructor(contentId: api.content.ContentId);
        setContentId(value: api.content.ContentId): IsRenderableRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<boolean>;
    }
}
declare module api.content.page {
    class PageResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourcePath;
        constructor();
        getResourcePath(): api.rest.Path;
        fromJsonToContent(json: api.content.json.ContentJson): api.content.Content;
    }
}
declare module api.content.page {
    /**
     * Request representing either a create, update or delete Request for a Page.
     */
    interface PageCUDRequest {
        sendAndParse(): wemQ.Promise<Content>;
    }
}
declare module api.content.page {
    import Content = api.content.Content;
    import ContentJson = api.content.json.ContentJson;
    class CreatePageRequest extends PageResourceRequest<ContentJson, Content> implements PageCUDRequest {
        private contentId;
        private controller;
        private template;
        private config;
        private regions;
        private fragment;
        private customized;
        constructor(contentId: api.content.ContentId);
        setController(controller: api.content.page.DescriptorKey): CreatePageRequest;
        setPageTemplateKey(pageTemplateKey: api.content.page.PageTemplateKey): CreatePageRequest;
        setConfig(config: api.data.PropertyTree): CreatePageRequest;
        setRegions(value: api.content.page.region.Regions): CreatePageRequest;
        setFragment(value: api.content.page.region.Component): CreatePageRequest;
        setCustomized(value: boolean): CreatePageRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Content>;
    }
}
declare module api.content.page {
    import Content = api.content.Content;
    import ContentJson = api.content.json.ContentJson;
    class UpdatePageRequest extends PageResourceRequest<ContentJson, Content> implements PageCUDRequest {
        private contentId;
        private controller;
        private template;
        private config;
        private regions;
        private fragment;
        private customized;
        constructor(contentId: api.content.ContentId);
        setController(controller: api.content.page.DescriptorKey): UpdatePageRequest;
        setPageTemplateKey(pageTemplateKey: api.content.page.PageTemplateKey): UpdatePageRequest;
        setConfig(config: api.data.PropertyTree): UpdatePageRequest;
        setRegions(value: api.content.page.region.Regions): UpdatePageRequest;
        setFragment(value: api.content.page.region.Component): UpdatePageRequest;
        setCustomized(value: boolean): UpdatePageRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Content>;
    }
}
declare module api.content.page {
    import Content = api.content.Content;
    import ContentJson = api.content.json.ContentJson;
    class DeletePageRequest extends PageResourceRequest<ContentJson, Content> implements PageCUDRequest {
        private contentId;
        constructor(contentId: api.content.ContentId);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<Content>;
    }
}
declare module api.content.page {
    import PropertyTree = api.data.PropertyTree;
    import Component = api.content.page.region.Component;
    class Page implements api.Equitable, api.Cloneable {
        private controller;
        private template;
        private regions;
        private fragment;
        private config;
        private customized;
        constructor(builder: PageBuilder);
        hasController(): boolean;
        getController(): DescriptorKey;
        hasTemplate(): boolean;
        getTemplate(): PageTemplateKey;
        hasRegions(): boolean;
        getRegions(): api.content.page.region.Regions;
        hasConfig(): boolean;
        getConfig(): PropertyTree;
        isCustomized(): boolean;
        getFragment(): Component;
        isFragment(): boolean;
        equals(o: api.Equitable): boolean;
        clone(): Page;
        doRegionComponentsContainId(id: ContentId): wemQ.Promise<boolean>;
        doesFragmentContainId(id: ContentId): boolean;
        private doRegionsContainId(regions, id, fragments?);
    }
    class PageBuilder {
        controller: DescriptorKey;
        template: PageTemplateKey;
        regions: api.content.page.region.Regions;
        config: PropertyTree;
        customized: boolean;
        fragment: Component;
        constructor(source?: Page);
        fromJson(json: api.content.page.PageJson): PageBuilder;
        setController(value: DescriptorKey): PageBuilder;
        setTemplate(value: PageTemplateKey): PageBuilder;
        setRegions(value: api.content.page.region.Regions): PageBuilder;
        setConfig(value: PropertyTree): PageBuilder;
        setCustomized(value: boolean): PageBuilder;
        setFragment(value: Component): PageBuilder;
        build(): Page;
    }
}
declare module api.content.page {
    enum PageMode {
        AUTOMATIC = 0,
        FORCED_TEMPLATE = 1,
        FORCED_CONTROLLER = 2,
        NO_CONTROLLER = 3,
        FRAGMENT = 4,
    }
    enum PageTemplateDisplayName {
        Automatic = 0,
        Custom = 1,
    }
}
declare module api.content.page {
    class PageModeChangedEvent {
        private previousMode;
        private newMode;
        constructor(previousMode: PageMode, newMode: PageMode);
        getPreviousMode(): PageMode;
        getNewMode(): PageMode;
    }
}
declare module api.content.page {
    import PropertyTree = api.data.PropertyTree;
    import ComponentPropertyChangedEvent = api.content.page.region.ComponentPropertyChangedEvent;
    class SetController {
        eventSource: any;
        descriptor: PageDescriptor;
        regions: api.content.page.region.Regions;
        config: PropertyTree;
        constructor(eventSource: any);
        setDescriptor(value: PageDescriptor): SetController;
        setRegions(value: api.content.page.region.Regions): SetController;
        setConfig(value: PropertyTree): SetController;
    }
    class SetTemplate {
        eventSource: any;
        template: PageTemplate;
        descriptor: PageDescriptor;
        regions: api.content.page.region.Regions;
        config: PropertyTree;
        constructor(eventSource: any);
        setTemplate(template: PageTemplate, descriptor: PageDescriptor): SetTemplate;
        setRegions(value: api.content.page.region.Regions): SetTemplate;
        setConfig(value: PropertyTree): SetTemplate;
    }
    class PageModel {
        static PROPERTY_REGIONS: string;
        static PROPERTY_TEMPLATE: string;
        static PROPERTY_CONTROLLER: string;
        static PROPERTY_CONFIG: string;
        private liveEditModel;
        private defaultTemplate;
        private defaultTemplateDescriptor;
        private mode;
        private controller;
        private template;
        private templateDescriptor;
        private regions;
        private fragment;
        private config;
        private pageModeChangedListeners;
        private propertyChangedListeners;
        private componentPropertyChangedListeners;
        private customizeChangedListeners;
        private resetListeners;
        private ignorePropertyChanges;
        private componentPropertyChangedEventHandler;
        private regionsChangedEventHandler;
        private configPropertyChangedHandler;
        private customized;
        constructor(liveEditModel: api.liveedit.LiveEditModel, defaultTemplate: PageTemplate, defaultTemplateDescriptor: PageDescriptor, pageMode: api.content.page.PageMode);
        /**
         * Whether to ignore changes happening with properties (regions, properties) or not.
         */
        setIgnorePropertyChanges(value: boolean): void;
        initializePageFromDefault(eventSource?: any): void;
        setCustomized(value: boolean): void;
        reset(eventSource?: any): void;
        private setMode(value);
        setController(setController: SetController): PageModel;
        initController(setController: SetController): PageModel;
        private setControllerData(setController);
        setTemplateContoller(): void;
        setAutomaticTemplate(eventSource?: any, ignoreRegionChanges?: boolean): PageModel;
        setTemplate(setTemplate: SetTemplate, ignoreRegionChanges?: boolean): PageModel;
        initTemplate(setTemplate: SetTemplate, ignoreRegionChanges?: boolean): PageModel;
        private setTemplateData(setTemplate, ignoreRegionChanges?);
        setRegions(value: api.content.page.region.Regions, eventOrigin?: any, ignoreRegionChanges?: boolean): PageModel;
        setConfig(value: PropertyTree, eventOrigin?: any): PageModel;
        /**
         * Automatic:           Content has no Page set. PageTemplate is automatically solved.
         *                      return: null;
         *
         * ForcedTemplate:      Content has a Page set with at Page.template set
         *
         * ForcedController:    Content has a Page set with at Page.controller set
         *
         * NoController:        Content is:
         *                      1. PageTemplate with no controller set
         *                      2. Content that has no Page set and no any template that can be used as default
         *                      3. Content that has a Page set with at Page.template set but template was deleted
         *                         or updated to not support content's type
         */
        getPage(): Page;
        getDefaultPageTemplate(): PageTemplate;
        getDefaultPageDescriptor(): PageDescriptor;
        getMode(): PageMode;
        isPageTemplate(): boolean;
        hasController(): boolean;
        /**
         * Return page descriptor depending on page mode
         */
        getDescriptor(): PageDescriptor;
        getController(): PageDescriptor;
        setControllerDescriptor(controller: PageDescriptor): void;
        hasTemplate(): boolean;
        hasDefaultPageTemplate(): boolean;
        getTemplateKey(): PageTemplateKey;
        getTemplate(): PageTemplate;
        getRegions(): api.content.page.region.Regions;
        getConfig(): PropertyTree;
        isCustomized(): boolean;
        private contentHasNonRenderableTemplateSet();
        private registerRegionsListeners(regions);
        private unregisterRegionsListeners(regions);
        private registerFragmentListeners(fragment);
        private unregisterFragmentListeners(fragment);
        onPageModeChanged(listener: (event: PageModeChangedEvent) => void): void;
        unPageModeChanged(listener: (event: PageModeChangedEvent) => void): void;
        private notifyPageModeChanged(oldValue, newValue);
        onPropertyChanged(listener: (event: api.PropertyChangedEvent) => void): void;
        unPropertyChanged(listener: (event: api.PropertyChangedEvent) => void): void;
        private notifyPropertyChanged(property, oldValue, newValue, origin);
        onComponentPropertyChangedEvent(listener: (event: ComponentPropertyChangedEvent) => void): void;
        unComponentPropertyChangedEvent(listener: (event: ComponentPropertyChangedEvent) => void): void;
        onCustomizeChanged(listener: (value: boolean) => void): void;
        unCustomizeChanged(listener: (value: boolean) => void): void;
        private notifyCustomizeChanged(value);
        onReset(listener: () => void): void;
        unReset(listener: () => void): void;
        private notifyReset();
    }
}
declare module api.content.page {
    class DescriptorByDisplayNameComparator implements api.Comparator<Descriptor> {
        compare(a: Descriptor, b: Descriptor): number;
    }
}
declare module api.content.page {
    class PageTemplateByDisplayNameComparator implements api.Comparator<PageTemplate> {
        compare(a: PageTemplate, b: PageTemplate): number;
    }
}
declare module api.content.page.region {
    class ComponentPath implements api.Equitable {
        private static DIVIDER;
        private regionAndComponentList;
        private refString;
        constructor(regionAndComponentList: ComponentPathRegionAndComponent[]);
        numberOfLevels(): number;
        getFirstLevel(): ComponentPathRegionAndComponent;
        getLastLevel(): ComponentPathRegionAndComponent;
        getLevels(): ComponentPathRegionAndComponent[];
        getComponentIndex(): number;
        getRegionPath(): RegionPath;
        removeFirstLevel(): ComponentPath;
        toString(): string;
        equals(o: api.Equitable): boolean;
        static fromString(str: string): ComponentPath;
        static fromRegionPathAndComponentIndex(regionPath: RegionPath, componentIndex: number): ComponentPath;
    }
    class ComponentPathRegionAndComponent {
        private static DIVIDER;
        private regionName;
        private componentIndex;
        private refString;
        constructor(regionName: string, componentIndex: number);
        getRegionName(): string;
        getComponentIndex(): number;
        toString(): string;
    }
}
declare module api.content.page.region {
    interface ComponentJson {
        name: string;
    }
}
declare module api.content.page.region {
    interface ComponentTypeWrapperJson {
        ImageComponent?: ImageComponentJson;
        PartComponent?: PartComponentJson;
        TextComponent?: TextComponentJson;
        LayoutComponent?: LayoutComponentJson;
        FragmentComponent?: FragmentComponentJson;
    }
}
declare module api.content.page.region {
    class ComponentName implements api.Equitable {
        private static COUNT_DELIMITER;
        private value;
        constructor(value: string);
        hasCountPostfix(): boolean;
        removeCountPostfix(): ComponentName;
        isDuplicateOf(other: ComponentName): boolean;
        createDuplicate(count: number): ComponentName;
        toString(): string;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.content.page.region {
    class ComponentType {
        private static shortNameToInstance;
        private shortName;
        constructor(shortName: string);
        getShortName(): string;
        newComponentBuilder(): ComponentBuilder<Component>;
        static byShortName(shortName: string): ComponentType;
        getDefaultName(): ComponentName;
    }
}
declare module api.content.page.region {
    class ComponentChangedEvent {
        private path;
        constructor(path: ComponentPath);
        getPath(): ComponentPath;
    }
}
declare module api.content.page.region {
    class ComponentPropertyChangedEvent extends ComponentChangedEvent {
        private component;
        private propertyName;
        constructor(builder: ComponentPropertyChangedEventBuilder);
        getComponent(): Component;
        getPropertyName(): string;
        static create(): ComponentPropertyChangedEventBuilder;
    }
    class ComponentPropertyChangedEventBuilder {
        propertyName: string;
        component: Component;
        setPropertyName(value: string): ComponentPropertyChangedEventBuilder;
        setComponent(value: Component): ComponentPropertyChangedEventBuilder;
        build(): ComponentPropertyChangedEvent;
    }
}
declare module api.content.page.region {
    class ComponentResetEvent extends ComponentChangedEvent {
        constructor(componentPath: ComponentPath);
    }
}
declare module api.content.page.region {
    class ComponentPropertyValueChangedEvent extends ComponentChangedEvent {
        private propertyName;
        constructor(path: ComponentPath, propertyName: string);
        getPropertyName(): string;
    }
}
declare module api.content.page.region {
    class Component implements api.Equitable, api.Cloneable {
        static PROPERTY_NAME: string;
        private index;
        private name;
        private parent;
        private changedListeners;
        private propertyChangedListeners;
        private propertyValueChangedListeners;
        private resetListeners;
        private type;
        constructor(builder: ComponentBuilder<any>);
        setParent(parent: Region): void;
        setIndex(value: number): void;
        getIndex(): number;
        getType(): ComponentType;
        hasPath(): boolean;
        getPath(): ComponentPath;
        getName(): ComponentName;
        setName(newValue: ComponentName): void;
        doReset(): void;
        reset(): void;
        isEmpty(): boolean;
        getParent(): Region;
        duplicate(): Component;
        remove(): void;
        toJson(): ComponentTypeWrapperJson;
        toString(): string;
        toComponentJson(): ComponentJson;
        equals(o: api.Equitable): boolean;
        clone(): Component;
        onChanged(listener: (event: ComponentChangedEvent) => void): void;
        unChanged(listener: (event: ComponentChangedEvent) => void): void;
        private notifyChangedEvent(event);
        onReset(listener: (event: ComponentResetEvent) => void): void;
        unReset(listener: (event: ComponentResetEvent) => void): void;
        private notifyResetEvent();
        /**
         * Observe when a property of Component have been reassigned.
         */
        onPropertyChanged(listener: (event: ComponentPropertyChangedEvent) => void): void;
        unPropertyChanged(listener: (event: ComponentPropertyChangedEvent) => void): void;
        notifyPropertyChanged(propertyName: string): void;
        forwardComponentPropertyChangedEvent(event: ComponentPropertyChangedEvent): void;
        /**
         * Observe when a property of Component have changed (happens only for mutable objects).
         */
        onPropertyValueChanged(listener: (event: ComponentPropertyValueChangedEvent) => void): void;
        unPropertyValueChanged(listener: (event: ComponentPropertyValueChangedEvent) => void): void;
        notifyPropertyValueChanged(propertyName: string): void;
    }
    class ComponentBuilder<COMPONENT extends Component> {
        name: ComponentName;
        index: number;
        parent: Region;
        type: ComponentType;
        constructor(source?: Component);
        setIndex(value: number): ComponentBuilder<COMPONENT>;
        setName(value: ComponentName): ComponentBuilder<COMPONENT>;
        setParent(value: Region): ComponentBuilder<COMPONENT>;
        setType(value: ComponentType): ComponentBuilder<COMPONENT>;
        build(): COMPONENT;
    }
}
declare module api.content.page.region {
    class ComponentFactory {
        static createFromJson(json: ComponentTypeWrapperJson, componentIndex: number, region: Region): Component;
    }
}
declare module api.content.page.region {
    interface DescriptorBasedComponentJson extends ComponentJson {
        descriptor: string;
        config: api.data.PropertyArrayJson[];
    }
}
declare module api.content.page.region {
    import PropertyTree = api.data.PropertyTree;
    class DescriptorBasedComponent extends Component implements api.Equitable, api.Cloneable {
        static debug: boolean;
        static PROPERTY_DESCRIPTOR: string;
        static PROPERTY_CONFIG: string;
        private disableEventForwarding;
        private descriptor;
        private config;
        private configChangedHandler;
        constructor(builder: DescriptorBasedComponentBuilder<any>);
        setDisableEventForwarding(value: boolean): void;
        hasDescriptor(): boolean;
        getDescriptor(): DescriptorKey;
        setDescriptor(descriptorKey: DescriptorKey, descriptor: Descriptor): void;
        setConfig(config: PropertyTree): void;
        getConfig(): PropertyTree;
        doReset(): void;
        toComponentJson(): DescriptorBasedComponentJson;
        equals(o: api.Equitable): boolean;
        clone(): DescriptorBasedComponent;
    }
    class DescriptorBasedComponentBuilder<DESCRIPTOR_BASED_COMPONENT extends DescriptorBasedComponent> extends ComponentBuilder<DESCRIPTOR_BASED_COMPONENT> {
        descriptor: DescriptorKey;
        config: PropertyTree;
        constructor(source?: DescriptorBasedComponent);
        setDescriptor(value: DescriptorKey): ComponentBuilder<DESCRIPTOR_BASED_COMPONENT>;
        setConfig(value: PropertyTree): ComponentBuilder<DESCRIPTOR_BASED_COMPONENT>;
        build(): DESCRIPTOR_BASED_COMPONENT;
    }
}
declare module api.content.page.region {
    class RegionsChangedEvent {
    }
}
declare module api.content.page.region {
    class RegionAddedEvent extends RegionsChangedEvent {
        private regionPath;
        constructor(regionPath: RegionPath);
        getRegionPath(): RegionPath;
    }
}
declare module api.content.page.region {
    class RegionRemovedEvent extends RegionsChangedEvent {
        private regionPath;
        constructor(regionPath: RegionPath);
        getRegionPath(): RegionPath;
    }
}
declare module api.content.page.region {
    class RegionChangedEvent extends RegionsChangedEvent {
        private regionPath;
        constructor(regionPath: RegionPath);
        getRegionPath(): RegionPath;
    }
}
declare module api.content.page.region {
    class Regions implements api.Equitable {
        static debug: boolean;
        private regionByName;
        private changedListeners;
        private componentPropertyChangedListeners;
        private regionChangedListeners;
        private regionAddedListeners;
        private regionRemovedListeners;
        private regionChangedEventHandler;
        private componentPropertyChangedEventHandler;
        constructor(builder: RegionsBuilder);
        mergeRegions(descriptorRegions: RegionDescriptor[], parent: LayoutComponent): Regions;
        addRegion(region: Region): void;
        private registerRegionListeners(region);
        private unregisterRegionListeners(region);
        removeRegions(regions: Region[]): void;
        getRegions(): Region[];
        getRegionByName(name: string): Region;
        getComponent(path: ComponentPath): Component;
        /**
         * Keeps existing regions (including components) if they are listed in given regionDescriptors.
         * Removes others and adds those missing.
         * @param regionDescriptors
         */
        changeRegionsTo(regionDescriptors: RegionDescriptor[]): void;
        toJson(): RegionJson[];
        equals(o: api.Equitable): boolean;
        clone(): Regions;
        onChanged(listener: (event: BaseRegionChangedEvent) => void): void;
        unChanged(listener: (event: BaseRegionChangedEvent) => void): void;
        private notifyChanged(event);
        onComponentPropertyChanged(listener: (event: ComponentPropertyChangedEvent) => void): void;
        unComponentPropertyChanged(listener: (event: ComponentPropertyChangedEvent) => void): void;
        private forwardComponentPropertyChangedEvent(event);
        onRegionChanged(listener: (event: RegionChangedEvent) => void): void;
        unRegionChanged(listener: (event: RegionChangedEvent) => void): void;
        private notifyRegionChanged(regionPath);
        onRegionAdded(listener: (event: RegionAddedEvent) => void): void;
        unRegionAdded(listener: (event: RegionAddedEvent) => void): void;
        private notifyRegionAdded(regionPath);
        onRegionRemoved(listener: (event: RegionRemovedEvent) => void): void;
        unRegionRemoved(listener: (event: RegionRemovedEvent) => void): void;
        private notifyRegionRemoved(regionPath);
        static create(): RegionsBuilder;
    }
    class RegionsBuilder {
        regions: Region[];
        constructor(source?: Regions);
        fromJson(regionsJson: RegionJson[], parent: LayoutComponent): RegionsBuilder;
        addRegion(value: Region): RegionsBuilder;
        build(): Regions;
    }
}
declare module api.content.page.region {
    interface ImageComponentJson extends ComponentJson {
        image: string;
        config: api.data.PropertyArrayJson[];
    }
}
declare module api.content.page.region {
    import PropertyTree = api.data.PropertyTree;
    class ImageComponent extends Component implements api.Equitable, api.Cloneable {
        static PROPERTY_IMAGE: string;
        static PROPERTY_CONFIG: string;
        static debug: boolean;
        private disableEventForwarding;
        private image;
        private config;
        private form;
        private configChangedHandler;
        constructor(builder: ImageComponentBuilder);
        setDisableEventForwarding(value: boolean): void;
        getImage(): api.content.ContentId;
        getForm(): api.form.Form;
        getConfig(): PropertyTree;
        setImage(contentId: api.content.ContentId, name: string): void;
        hasImage(): boolean;
        doReset(): void;
        isEmpty(): boolean;
        toJson(): ComponentTypeWrapperJson;
        equals(o: api.Equitable): boolean;
        clone(): ImageComponent;
    }
    class ImageComponentBuilder extends ComponentBuilder<ImageComponent> {
        image: api.content.ContentId;
        config: PropertyTree;
        constructor(source?: ImageComponent);
        setImage(value: api.content.ContentId): ImageComponentBuilder;
        setConfig(value: PropertyTree): ImageComponentBuilder;
        fromJson(json: ImageComponentJson, region: Region): ImageComponentBuilder;
        build(): ImageComponent;
    }
}
declare module api.content.page.region {
    class ImageComponentType extends ComponentType {
        private static INSTANCE;
        constructor();
        newComponentBuilder(): ImageComponentBuilder;
        static get(): ImageComponentType;
    }
}
declare module api.content.page.region {
    class TextComponent extends Component implements api.Equitable, api.Cloneable {
        private text;
        static PROPERTY_TEXT: string;
        constructor(builder?: TextComponentBuilder);
        getText(): string;
        setText(value?: string, silent?: boolean): void;
        doReset(): void;
        isEmpty(): boolean;
        toJson(): ComponentTypeWrapperJson;
        equals(o: api.Equitable): boolean;
        clone(): TextComponent;
    }
    class TextComponentBuilder extends ComponentBuilder<TextComponent> {
        text: string;
        constructor(source?: TextComponent);
        fromJson(json: TextComponentJson, region: Region): TextComponentBuilder;
        setText(value: string): TextComponentBuilder;
        build(): TextComponent;
    }
}
declare module api.content.page.region {
    class TextComponentType extends ComponentType {
        private static INSTANCE;
        constructor();
        newComponentBuilder(): TextComponentBuilder;
        static get(): TextComponentType;
    }
}
declare module api.content.page.region {
    interface TextComponentJson extends ComponentJson {
        text: string;
    }
}
declare module api.content.page.region {
    import PropertyTree = api.data.PropertyTree;
    class FragmentComponent extends Component implements api.Equitable, api.Cloneable {
        static PROPERTY_FRAGMENT: string;
        static PROPERTY_CONFIG: string;
        static debug: boolean;
        private disableEventForwarding;
        private fragment;
        private config;
        private configChangedHandler;
        constructor(builder: FragmentComponentBuilder);
        setDisableEventForwarding(value: boolean): void;
        getFragment(): api.content.ContentId;
        getConfig(): PropertyTree;
        setFragment(contentId: api.content.ContentId, name: string): void;
        hasFragment(): boolean;
        doReset(): void;
        isEmpty(): boolean;
        toJson(): ComponentTypeWrapperJson;
        equals(o: api.Equitable): boolean;
        clone(): FragmentComponent;
    }
    class FragmentComponentBuilder extends ComponentBuilder<FragmentComponent> {
        fragment: api.content.ContentId;
        config: PropertyTree;
        constructor(source?: FragmentComponent);
        setFragment(value: api.content.ContentId): FragmentComponentBuilder;
        setConfig(value: PropertyTree): FragmentComponentBuilder;
        fromJson(json: FragmentComponentJson, region: Region): FragmentComponentBuilder;
        build(): FragmentComponent;
    }
}
declare module api.content.page.region {
    class FragmentComponentType extends ComponentType {
        private static INSTANCE;
        constructor();
        newComponentBuilder(): FragmentComponentBuilder;
        static get(): FragmentComponentType;
    }
}
declare module api.content.page.region {
    interface FragmentComponentJson extends ComponentJson {
        fragment: string;
        config: api.data.PropertyArrayJson[];
    }
}
declare module api.content.page.region {
    import Option = api.ui.selector.Option;
    import ContentSummary = api.content.ContentSummary;
    import ContentPath = api.content.ContentPath;
    import FragmentContentSummaryLoader = api.content.resource.FragmentContentSummaryLoader;
    import RichDropdown = api.ui.selector.dropdown.RichDropdown;
    class FragmentDropdown extends RichDropdown<ContentSummary> {
        protected loader: FragmentContentSummaryLoader;
        private parentSitePath;
        private contentPath;
        constructor(sitePath: string, contentPath: ContentPath);
        load(): void;
        protected createLoader(): FragmentContentSummaryLoader;
        protected createOption(fragment: ContentSummary): Option<ContentSummary>;
        addFragmentOption(fragment: ContentSummary): void;
        setSelection(fragment: ContentSummary): void;
        getSelection(contentId: ContentId): ContentSummary;
    }
}
declare module api.content.page.region {
    interface PartDescriptorJson extends api.content.page.DescriptorJson {
    }
}
declare module api.content.page.region {
    interface PartComponentJson extends DescriptorBasedComponentJson {
    }
}
declare module api.content.page.region {
    interface PartDescriptorsJson {
        descriptors: PartDescriptorJson[];
    }
}
declare module api.content.page.region {
    class PartDescriptor extends api.content.page.Descriptor implements api.Cloneable {
        clone(): PartDescriptor;
    }
    class PartDescriptorBuilder extends api.content.page.DescriptorBuilder {
        constructor(source?: PartDescriptor);
        fromJson(json: PartDescriptorJson): PartDescriptorBuilder;
        setKey(value: api.content.page.DescriptorKey): PartDescriptorBuilder;
        setName(value: api.content.page.DescriptorName): PartDescriptorBuilder;
        setDisplayName(value: string): PartDescriptorBuilder;
        setConfig(value: api.form.Form): PartDescriptorBuilder;
        build(): PartDescriptor;
    }
}
import ApplicationKey = api.application.ApplicationKey;
declare module api.content.page.region {
    class PartDescriptorDropdown extends DescriptorBasedDropdown<PartDescriptor> {
        protected loader: PartDescriptorLoader;
        constructor();
        loadDescriptors(applicationKeys: ApplicationKey[]): void;
        protected createLoader(): PartDescriptorLoader;
    }
}
declare module api.content.page.region {
    class PartComponent extends DescriptorBasedComponent implements api.Equitable, api.Cloneable {
        constructor(builder: PartComponentBuilder);
        toJson(): ComponentTypeWrapperJson;
        isEmpty(): boolean;
        equals(o: api.Equitable): boolean;
        clone(): PartComponent;
    }
    class PartComponentBuilder extends DescriptorBasedComponentBuilder<PartComponent> {
        constructor(source?: PartComponent);
        fromJson(json: PartComponentJson, region: Region): PartComponentBuilder;
        build(): PartComponent;
    }
}
declare module api.content.page.region {
    class PartComponentType extends ComponentType {
        private static INSTANCE;
        constructor();
        newComponentBuilder(): PartComponentBuilder;
        static get(): PartComponentType;
    }
}
declare module api.content.page.region {
    class PartDescriptorViewer extends api.ui.NamesAndIconViewer<PartDescriptor> {
        constructor();
        resolveDisplayName(object: PartDescriptor): string;
        resolveSubName(object: PartDescriptor, relativePath?: boolean): string;
        resolveIconClass(object: PartDescriptor): string;
    }
}
declare module api.content.page.region {
    import RichComboBox = api.ui.selector.combobox.RichComboBox;
    import Option = api.ui.selector.Option;
    import SelectedOption = api.ui.selector.combobox.SelectedOption;
    import BaseSelectedOptionView = api.ui.selector.combobox.BaseSelectedOptionView;
    import BaseSelectedOptionsView = api.ui.selector.combobox.BaseSelectedOptionsView;
    import DescriptorKey = api.content.page.DescriptorKey;
    import ApplicationKey = api.application.ApplicationKey;
    class PartDescriptorComboBox extends RichComboBox<PartDescriptor> {
        constructor();
        loadDescriptors(applicationKeys: ApplicationKey[]): void;
        getDescriptor(descriptorKey: DescriptorKey): PartDescriptor;
        setDescriptor(descriptor: PartDescriptor): void;
    }
    class PartDescriptorSelectedOptionsView extends BaseSelectedOptionsView<PartDescriptor> {
        createSelectedOption(option: Option<PartDescriptor>): SelectedOption<PartDescriptor>;
    }
    class PartDescriptorSelectedOptionView extends BaseSelectedOptionView<PartDescriptor> {
        private descriptor;
        constructor(option: Option<PartDescriptor>);
        doRender(): wemQ.Promise<boolean>;
    }
}
declare module api.content.page.region {
    import ApplicationKey = api.application.ApplicationKey;
    class PartDescriptorLoader extends api.util.loader.BaseLoader<PartDescriptorsJson, PartDescriptor> {
        protected request: GetPartDescriptorsByApplicationsRequest;
        constructor();
        filterFn(descriptor: PartDescriptor): boolean;
        protected createRequest(): GetPartDescriptorsByApplicationsRequest;
        setApplicationKeys(applicationKeys: ApplicationKey[]): void;
    }
}
declare module api.content.page.region {
    class PartDescriptorResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourcePath;
        cache: PartDescriptorCache;
        constructor();
        getResourcePath(): api.rest.Path;
        fromJsonToPartDescriptor(json: PartDescriptorJson): PartDescriptor;
    }
}
declare module api.content.page.region {
    class PartDescriptorsResourceRequest extends PartDescriptorResourceRequest<PartDescriptorsJson, PartDescriptor[]> {
        fromJsonToPartDescriptors(json: PartDescriptorsJson): PartDescriptor[];
    }
}
declare module api.content.page.region {
    import ApplicationKey = api.application.ApplicationKey;
    class GetPartDescriptorsByApplicationsRequest extends PartDescriptorsResourceRequest {
        private applicationKeys;
        setApplicationKeys(applicationKeys: ApplicationKey[]): void;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<PartDescriptor[]>;
    }
}
declare module api.content.page.region {
    class GetPartDescriptorsByApplicationRequest extends PartDescriptorsResourceRequest {
        private applicationKey;
        constructor(applicationKey: api.application.ApplicationKey);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<PartDescriptor[]>;
    }
}
declare module api.content.page.region {
    class GetPartDescriptorByKeyRequest extends PartDescriptorResourceRequest<PartDescriptorJson, PartDescriptor> {
        private key;
        constructor(key: api.content.page.DescriptorKey);
        setKey(key: api.content.page.DescriptorKey): void;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<PartDescriptor>;
    }
}
declare module api.content.page.region {
    import ApplicationKey = api.application.ApplicationKey;
    import ApplicationBasedCache = api.application.ApplicationBasedCache;
    import DescriptorKey = api.content.page.DescriptorKey;
    class PartDescriptorCache extends ApplicationBasedCache<PartDescriptorApplicationCache, PartDescriptor, DescriptorKey> {
        private static instance;
        static get(): PartDescriptorCache;
        constructor();
        loadByApplication(applicationKey: ApplicationKey): void;
        put(descriptor: PartDescriptor): void;
        getByKey(key: DescriptorKey): PartDescriptor;
        createApplicationCache(): PartDescriptorApplicationCache;
    }
    class PartDescriptorApplicationCache extends api.cache.Cache<PartDescriptor, DescriptorKey> {
        copy(object: PartDescriptor): PartDescriptor;
        getKeyFromObject(object: PartDescriptor): DescriptorKey;
        getKeyAsString(key: DescriptorKey): string;
    }
}
declare module api.content.page.region {
    interface LayoutDescriptorJson extends api.content.page.DescriptorJson {
        regions: RegionsDescriptorJson[];
    }
}
declare module api.content.page.region {
    interface LayoutComponentJson extends DescriptorBasedComponentJson {
        regions: RegionJson[];
    }
}
declare module api.content.page.region {
    interface LayoutDescriptorsJson {
        descriptors: LayoutDescriptorJson[];
    }
}
declare module api.content.page.region {
    class LayoutDescriptor extends api.content.page.Descriptor implements api.Cloneable {
        private regions;
        constructor(builder: LayoutDescriptorBuilder);
        getRegions(): RegionDescriptor[];
        clone(): LayoutDescriptor;
    }
    class LayoutDescriptorBuilder extends api.content.page.DescriptorBuilder {
        regions: RegionDescriptor[];
        constructor(source?: LayoutDescriptor);
        fromJson(json: LayoutDescriptorJson): LayoutDescriptorBuilder;
        setKey(value: api.content.page.DescriptorKey): LayoutDescriptorBuilder;
        setName(value: api.content.page.DescriptorName): LayoutDescriptorBuilder;
        setDisplayName(value: string): LayoutDescriptorBuilder;
        setConfig(value: api.form.Form): LayoutDescriptorBuilder;
        addRegion(value: RegionDescriptor): LayoutDescriptorBuilder;
        build(): LayoutDescriptor;
    }
}
declare module api.content.page.region {
    class LayoutComponentType extends ComponentType {
        private static INSTANCE;
        constructor();
        newComponentBuilder(): LayoutComponentBuilder;
        static get(): LayoutComponentType;
    }
}
declare module api.content.page.region {
    class LayoutComponent extends DescriptorBasedComponent implements api.Equitable, api.Cloneable {
        static debug: boolean;
        private regions;
        private componentPropertyChangedListeners;
        private componentPropertyChangedEventHandler;
        private regionsChangedEventHandler;
        constructor(builder: LayoutComponentBuilder);
        getComponent(path: ComponentPath): Component;
        getRegions(): Regions;
        setRegions(value: Regions): void;
        setDescriptor(descriptorKey: DescriptorKey, descriptor?: LayoutDescriptor): void;
        addRegions(layoutDescriptor: LayoutDescriptor): void;
        isEmpty(): boolean;
        toJson(): ComponentTypeWrapperJson;
        equals(o: api.Equitable): boolean;
        clone(): LayoutComponent;
        private registerRegionsListeners(regions);
        private unregisterRegionsListeners(regions);
        onComponentPropertyChanged(listener: (event: ComponentPropertyChangedEvent) => void): void;
        unComponentPropertyChanged(listener: (event: ComponentPropertyChangedEvent) => void): void;
    }
    class LayoutComponentBuilder extends DescriptorBasedComponentBuilder<LayoutComponent> {
        regions: Regions;
        constructor(source?: LayoutComponent);
        fromJson(json: LayoutComponentJson, region: Region): LayoutComponent;
        setRegions(value: Regions): LayoutComponentBuilder;
        build(): LayoutComponent;
    }
}
declare module api.content.page.region {
    class LayoutDescriptorViewer extends api.ui.NamesAndIconViewer<LayoutDescriptor> {
        constructor();
        resolveDisplayName(object: LayoutDescriptor): string;
        resolveSubName(object: LayoutDescriptor, relativePath?: boolean): string;
        resolveIconClass(object: LayoutDescriptor): string;
    }
}
declare module api.content.page.region {
    import RichComboBox = api.ui.selector.combobox.RichComboBox;
    import Option = api.ui.selector.Option;
    import SelectedOption = api.ui.selector.combobox.SelectedOption;
    import BaseSelectedOptionView = api.ui.selector.combobox.BaseSelectedOptionView;
    import BaseSelectedOptionsView = api.ui.selector.combobox.BaseSelectedOptionsView;
    import DescriptorKey = api.content.page.DescriptorKey;
    class LayoutDescriptorComboBox extends RichComboBox<LayoutDescriptor> {
        constructor();
        loadDescriptors(applicationKeys: ApplicationKey[]): void;
        getDescriptor(descriptorKey: DescriptorKey): LayoutDescriptor;
        setDescriptor(descriptor: LayoutDescriptor): void;
    }
    class LayoutDescriptorSelectedOptionsView extends BaseSelectedOptionsView<LayoutDescriptor> {
        createSelectedOption(option: Option<LayoutDescriptor>): SelectedOption<LayoutDescriptor>;
    }
    class LayoutDescriptorSelectedOptionView extends BaseSelectedOptionView<LayoutDescriptor> {
        private descriptor;
        constructor(option: Option<LayoutDescriptor>);
        doRender(): wemQ.Promise<boolean>;
    }
}
declare module api.content.page.region {
    class LayoutDescriptorLoader extends api.util.loader.BaseLoader<LayoutDescriptorsJson, LayoutDescriptor> {
        protected request: GetLayoutDescriptorsByApplicationsRequest;
        constructor();
        filterFn(descriptor: LayoutDescriptor): boolean;
        protected createRequest(): GetLayoutDescriptorsByApplicationsRequest;
        setApplicationKeys(applicationKeys: ApplicationKey[]): void;
    }
}
declare module api.content.page.region {
    class LayoutDescriptorResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourcePath;
        cache: LayoutDescriptorCache;
        constructor();
        getResourcePath(): api.rest.Path;
        fromJsonToLayoutDescriptor(json: LayoutDescriptorJson): LayoutDescriptor;
    }
}
declare module api.content.page.region {
    class LayoutDescriptorsResourceRequest extends LayoutDescriptorResourceRequest<LayoutDescriptorsJson, LayoutDescriptor[]> {
        fromJsonToLayoutDescriptors(json: LayoutDescriptorsJson): LayoutDescriptor[];
    }
}
declare module api.content.page.region {
    class GetLayoutDescriptorsByApplicationRequest extends LayoutDescriptorsResourceRequest {
        private applicationKey;
        constructor(applicationKey: api.application.ApplicationKey);
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<LayoutDescriptor[]>;
    }
}
declare module api.content.page.region {
    class GetLayoutDescriptorsByApplicationsRequest extends LayoutDescriptorsResourceRequest {
        private applicationKeys;
        setApplicationKeys(applicationKeys: api.application.ApplicationKey[]): void;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<LayoutDescriptor[]>;
    }
}
declare module api.content.page.region {
    class GetLayoutDescriptorByKeyRequest extends LayoutDescriptorResourceRequest<LayoutDescriptorJson, LayoutDescriptor> {
        private key;
        constructor(key: api.content.page.DescriptorKey);
        setKey(key: api.content.page.DescriptorKey): void;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<LayoutDescriptor>;
    }
}
declare module api.content.page.region {
    class LayoutDescriptorDropdown extends DescriptorBasedDropdown<LayoutDescriptor> {
        protected loader: LayoutDescriptorLoader;
        constructor();
        loadDescriptors(applicationKeys: ApplicationKey[]): void;
        protected createLoader(): LayoutDescriptorLoader;
    }
}
declare module api.content.page.region {
    class LayoutRegionsMerger {
        private layoutComponentRegions;
        private targetRegionsByName;
        private targetRegionsNameByPosition;
        private sourceRegionsPositionByName;
        /**
         * Merge the components of regions existing in a layout component, distribute them
         * in the regions of the target layout descriptor according to following rules:
         *  - If a region with the same name exists on the target layout:
         *    move components from source into region with the same name
         *  - If a region with the same name does not exists, but exists a region
         *    with the same position (index) on target: move components to target region with the same position
         *  - If a region with the same name or position (index) cannot be found on target:
         *    move components to the last region of target
         *
         */
        merge(regions: Regions, layoutDescriptorRegions: RegionDescriptor[], parent: LayoutComponent): Regions;
        /**
         * Merge components from regions that already exist in target layout descriptor
         */
        private mergeExistingRegions();
        /**
         * Merge components from regions that are missing in target layout descriptor
         */
        private mergeMissingRegions(layoutDescriptorRegions);
        private initLookupTables(layoutDescriptorRegions, parent);
        private addComponents(fromRegion, toRegion);
    }
}
declare module api.content.page.region {
    import ApplicationKey = api.application.ApplicationKey;
    import ApplicationBasedCache = api.application.ApplicationBasedCache;
    import DescriptorKey = api.content.page.DescriptorKey;
    class LayoutDescriptorCache extends ApplicationBasedCache<LayoutDescriptorApplicationCache, LayoutDescriptor, DescriptorKey> {
        private static instance;
        static get(): LayoutDescriptorCache;
        constructor();
        loadByApplication(applicationKey: ApplicationKey): void;
        put(descriptor: LayoutDescriptor): void;
        getByKey(key: DescriptorKey): LayoutDescriptor;
        createApplicationCache(): LayoutDescriptorApplicationCache;
    }
    class LayoutDescriptorApplicationCache extends api.cache.Cache<LayoutDescriptor, DescriptorKey> {
        copy(object: LayoutDescriptor): LayoutDescriptor;
        getKeyFromObject(object: LayoutDescriptor): DescriptorKey;
        getKeyAsString(key: DescriptorKey): string;
    }
}
declare module api.content.page.region {
    class RegionPath implements api.Equitable {
        private static DIVIDER;
        private parentComponentPath;
        private regionName;
        private refString;
        constructor(parentComponentPath: ComponentPath, regionName: string);
        hasParentComponentPath(): boolean;
        getParentComponentPath(): ComponentPath;
        getRegionName(): string;
        toString(): string;
        equals(o: api.Equitable): boolean;
        static fromString(str: string): RegionPath;
    }
}
declare module api.content.page.region {
    interface RegionsDescriptorJson {
        name: string;
    }
}
declare module api.content.page.region {
    interface RegionJson {
        name: string;
        components: ComponentTypeWrapperJson[];
    }
}
declare module api.content.page.region {
    class RegionDescriptor {
        private name;
        constructor(builder: RegionDescriptorBuilder);
        getName(): string;
    }
    class RegionDescriptorBuilder {
        name: string;
        fromJson(json: RegionsDescriptorJson): RegionDescriptorBuilder;
        setName(value: string): RegionDescriptorBuilder;
        build(): RegionDescriptor;
    }
}
declare module api.content.page.region {
    class BaseRegionChangedEvent {
        private path;
        constructor(path: RegionPath);
        getPath(): RegionPath;
    }
}
declare module api.content.page.region {
    class RegionPropertyChangedEvent extends BaseRegionChangedEvent {
        private propertyName;
        constructor(path: RegionPath, propertyName: string);
        getPropertyName(): string;
    }
}
declare module api.content.page.region {
    class RegionPropertyValueChangedEvent extends BaseRegionChangedEvent {
        private propertyName;
        constructor(path: RegionPath, propertyName: string);
        getPropertyName(): string;
    }
}
declare module api.content.page.region {
    class ComponentAddedEvent extends BaseRegionChangedEvent {
        private componentPath;
        constructor(regionPath: RegionPath, componentPath: ComponentPath);
        getComponentPath(): ComponentPath;
    }
}
declare module api.content.page.region {
    class ComponentRemovedEvent extends BaseRegionChangedEvent {
        private componentPath;
        constructor(regionPath: RegionPath, componentPath: ComponentPath);
        getComponentPath(): ComponentPath;
    }
}
declare module api.content.page.region {
    class Region implements api.Equitable, api.Cloneable {
        static debug: boolean;
        private name;
        private components;
        private parent;
        private changedListeners;
        private componentAddedListeners;
        private componentRemovedListeners;
        private componentPropertyChangedListeners;
        private propertyValueChangedListeners;
        private componentChangedEventHandler;
        private componentPropertyChangedEventHandler;
        constructor(builder: RegionBuilder);
        getName(): string;
        setParent(value: LayoutComponent): void;
        getParent(): LayoutComponent;
        getPath(): RegionPath;
        isEmpty(): boolean;
        empty(): void;
        addComponent(component: Component, index?: number): Component;
        removeComponent(component: Component): Component;
        getComponents(): Component[];
        getComponentByIndex(index: number): Component;
        toJson(): RegionJson;
        toString(): string;
        equals(o: api.Equitable): boolean;
        clone(): Region;
        private checkIllegalLayoutComponentWithinLayoutComponent(component, parent);
        private refreshIndexes(start?);
        private registerComponent(component, index?);
        private unregisterComponent(component);
        onChanged(listener: (event: BaseRegionChangedEvent) => void): void;
        unChanged(listener: (event: BaseRegionChangedEvent) => void): void;
        private notifyChangedEvent(event);
        onComponentAdded(listener: (event: ComponentAddedEvent) => void): void;
        unComponentAdded(listener: (event: ComponentAddedEvent) => void): void;
        private notifyComponentAdded(componentPath);
        onComponentRemoved(listener: (event: ComponentRemovedEvent) => void): void;
        unComponentRemoved(listener: (event: ComponentRemovedEvent) => void): void;
        private notifyComponentRemoved(componentPath);
        onComponentPropertyChangedEvent(listener: (event: ComponentPropertyChangedEvent) => void): void;
        unComponentPropertyChangedEvent(listener: (event: ComponentPropertyChangedEvent) => void): void;
        private forwardComponentPropertyChangedEvent(event);
        onRegionPropertyValueChanged(listener: (event: RegionPropertyValueChangedEvent) => void): void;
        unRegionPropertyValueChanged(listener: (event: RegionPropertyValueChangedEvent) => void): void;
        private notifyRegionPropertyValueChanged(propertyName);
        static create(source?: Region): RegionBuilder;
    }
    class RegionBuilder {
        name: string;
        components: Component[];
        parent: LayoutComponent;
        constructor(source?: Region);
        setName(value: string): RegionBuilder;
        setParent(value: LayoutComponent): RegionBuilder;
        addComponent(value: Component): RegionBuilder;
        build(): Region;
    }
}
declare module api.content.page.region {
    class FragmentResourceRequest<JSON_TYPE, PARSED_TYPE> extends api.rest.ResourceRequest<JSON_TYPE, PARSED_TYPE> {
        private resourcePath;
        constructor();
        getResourcePath(): api.rest.Path;
        fromJsonToContent(json: api.content.json.ContentJson): api.content.Content;
    }
}
declare module api.content.page.region {
    class CreateFragmentRequest extends FragmentResourceRequest<api.content.json.ContentJson, api.content.Content> {
        private contentId;
        private config;
        private component;
        constructor(contentId: api.content.ContentId);
        setConfig(config: api.data.PropertyTree): CreateFragmentRequest;
        setComponent(value: api.content.page.region.Component): CreateFragmentRequest;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<api.content.Content>;
    }
}
declare module api.content.site {
    import PropertySet = api.data.PropertySet;
    import ApplicationKey = api.application.ApplicationKey;
    class SiteConfig implements api.Equitable, api.Cloneable {
        private applicationKey;
        private config;
        constructor(builder: SiteConfigBuilder);
        getApplicationKey(): api.application.ApplicationKey;
        getConfig(): PropertySet;
        toJson(): Object;
        equals(o: api.Equitable): boolean;
        clone(): SiteConfig;
        static create(): SiteConfigBuilder;
    }
    class SiteConfigBuilder {
        applicationKey: ApplicationKey;
        config: PropertySet;
        constructor(source?: SiteConfig);
        fromData(propertySet: PropertySet): SiteConfigBuilder;
        setApplicationKey(value: api.application.ApplicationKey): SiteConfigBuilder;
        setConfig(value: PropertySet): SiteConfigBuilder;
        build(): SiteConfig;
    }
}
declare module api.content.site {
    import ApplicationKey = api.application.ApplicationKey;
    class Site extends api.content.Content implements api.Equitable, api.Cloneable {
        constructor(builder: SiteBuilder);
        isSite(): boolean;
        getDescription(): string;
        getSiteConfigs(): SiteConfig[];
        getApplicationKeys(): ApplicationKey[];
        equals(o: api.Equitable, ignoreEmptyValues?: boolean, shallow?: boolean): boolean;
        clone(): Site;
        newBuilder(): SiteBuilder;
    }
    class SiteBuilder extends api.content.ContentBuilder {
        constructor(source?: Site);
        fromContentJson(contentJson: api.content.json.ContentJson): SiteBuilder;
        build(): Site;
    }
}
declare module api.content.site {
    import ApplicationKey = api.application.ApplicationKey;
    import ApplicationEvent = api.application.ApplicationEvent;
    class SiteModel {
        private site;
        private siteConfigs;
        private applicationAddedListeners;
        private applicationRemovedListeners;
        private propertyChangedListeners;
        private applicationPropertyAddedListener;
        private applicationPropertyRemovedListener;
        private applicationGlobalEventsListener;
        private applicationUnavailableListeners;
        private applicationStartedListeners;
        constructor(site: Site);
        private initApplicationPropertyListeners();
        private setup(site);
        update(site: Site): void;
        getSite(): Site;
        getSiteId(): api.content.ContentId;
        getApplicationKeys(): ApplicationKey[];
        onPropertyChanged(listener: (event: api.PropertyChangedEvent) => void): void;
        unPropertyChanged(listener: (event: api.PropertyChangedEvent) => void): void;
        private notifyPropertyChanged(property, oldValue, newValue, source);
        onApplicationAdded(listener: (event: ApplicationAddedEvent) => void): void;
        unApplicationAdded(listener: (event: ApplicationAddedEvent) => void): void;
        private notifyApplicationAdded(siteConfig);
        onApplicationRemoved(listener: (event: ApplicationRemovedEvent) => void): void;
        unApplicationRemoved(listener: (event: ApplicationRemovedEvent) => void): void;
        private notifyApplicationRemoved(applicationKey);
        onApplicationUnavailable(listener: (applicationEvent: ApplicationEvent) => void): void;
        unApplicationUnavailable(listener: (applicationEvent: ApplicationEvent) => void): void;
        private notifyApplicationUnavailable(applicationEvent);
        onApplicationStarted(listener: (applicationEvent: ApplicationEvent) => void): void;
        unApplicationStarted(listener: (applicationEvent: ApplicationEvent) => void): void;
        private notifyApplicationStarted(applicationEvent);
    }
}
declare module api.content.site {
    class ApplicationAddedEvent {
        private siteConfig;
        constructor(siteConfig: SiteConfig);
        getApplicationKey(): api.application.ApplicationKey;
        getSiteConfig(): SiteConfig;
    }
}
declare module api.content.site {
    import ApplicationKey = api.application.ApplicationKey;
    class ApplicationRemovedEvent {
        private applicationKey;
        constructor(applicationKey: ApplicationKey);
        getApplicationKey(): ApplicationKey;
    }
}
declare module api.content.form {
    import PropertyPath = api.data.PropertyPath;
    import FormState = api.app.wizard.FormState;
    class ContentFormContext extends api.form.FormContext {
        private site;
        private parentContent;
        private persistedContent;
        private contentTypeName;
        private formState;
        constructor(builder: ContentFormContextBuilder);
        getSite(): api.content.site.Site;
        getFormState(): FormState;
        getContentId(): api.content.ContentId;
        getContentPath(): api.content.ContentPath;
        getParentContentPath(): api.content.ContentPath;
        getPersistedContent(): api.content.Content;
        getContentTypeName(): api.schema.content.ContentTypeName;
        createInputTypeViewContext(inputTypeConfig: any, parentPropertyPath: PropertyPath, input: api.form.Input): api.form.inputtype.InputTypeViewContext;
        static create(): ContentFormContextBuilder;
    }
    class ContentFormContextBuilder extends api.form.FormContextBuilder {
        site: api.content.site.Site;
        parentContent: api.content.Content;
        persistedContent: api.content.Content;
        contentTypeName: api.schema.content.ContentTypeName;
        formState: FormState;
        setSite(value: api.content.site.Site): ContentFormContextBuilder;
        setParentContent(value: api.content.Content): ContentFormContextBuilder;
        setPersistedContent(value: api.content.Content): ContentFormContextBuilder;
        setContentTypeName(value: api.schema.content.ContentTypeName): ContentFormContextBuilder;
        setFormState(value: FormState): ContentFormContextBuilder;
        build(): ContentFormContext;
    }
}
declare module api.content.form.inputtype {
    interface ContentInputTypeViewContext extends api.form.inputtype.InputTypeViewContext {
        formContext: api.content.form.ContentFormContext;
        site: api.content.site.Site;
        content: api.content.ContentSummary;
        contentPath: api.content.ContentPath;
        parentContentPath: api.content.ContentPath;
    }
}
declare module api.content.form.inputtype {
    import RichComboBox = api.ui.selector.combobox.RichComboBox;
    import RelationshipTypeName = api.schema.relationshiptype.RelationshipTypeName;
    import SelectedOption = api.ui.selector.combobox.SelectedOption;
    import ContentServerChangeItem = api.content.event.ContentServerChangeItem;
    import SelectedOptionsView = api.ui.selector.combobox.SelectedOptionsView;
    import BaseInputTypeManagingAdd = api.form.inputtype.support.BaseInputTypeManagingAdd;
    class ContentInputTypeManagingAdd<RAW_VALUE_TYPE> extends BaseInputTypeManagingAdd<RAW_VALUE_TYPE> {
        protected config: api.content.form.inputtype.ContentInputTypeViewContext;
        protected relationshipTypeName: RelationshipTypeName;
        protected relationshipType: string;
        protected allowedContentTypes: string[];
        protected allowedContentPaths: string[];
        protected contentDeletedListener: (paths: ContentServerChangeItem[], pending?: boolean) => void;
        constructor(className?: string, config?: api.content.form.inputtype.ContentInputTypeViewContext);
        protected getContentComboBox(): RichComboBox<any>;
        protected getContentPath(raw: RAW_VALUE_TYPE): ContentPath;
        protected getSelectedOptions(): SelectedOption<RAW_VALUE_TYPE>[];
        protected getSelectedOptionsView(): SelectedOptionsView<RAW_VALUE_TYPE>;
        protected readConfig(inputConfig: {
            [element: string]: {
                [name: string]: string;
            }[];
        }): void;
        private handleContentUpdatedEvent();
        private findSelectedOptionByContentPath(contentPath);
        private handleContentDeletedEvent();
    }
}
declare module api.content.form.inputtype.upload {
    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    class ImageUploader extends api.form.inputtype.support.BaseInputTypeSingleOccurrence<string> {
        private imageUploader;
        private previousValidationRecording;
        constructor(config: api.content.form.inputtype.ContentInputTypeViewContext);
        private initUploader(config);
        getContext(): api.content.form.inputtype.ContentInputTypeViewContext;
        getValueType(): ValueType;
        newInitialValue(): Value;
        layoutProperty(input: api.form.Input, property: Property): wemQ.Promise<void>;
        protected saveToProperty(value: api.data.Value): void;
        updateProperty(property: api.data.Property, unchangedOnly?: boolean): Q.Promise<void>;
        reset(): void;
        private saveEditDataToProperty(crop, zoom, focus);
        private getPropertyContainer(property);
        private getFocalPoint(content);
        private getRectFromProperty(content, propertyName);
        private getMediaProperty(content, propertyName);
        private configEditorsProperties(content);
        validate(silent?: boolean): api.form.inputtype.InputValidationRecording;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.content.form.inputtype.upload {
    import Property = api.data.Property;
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import UploaderEl = api.ui.uploader.UploaderEl;
    import FileUploaderEl = api.ui.uploader.FileUploaderEl;
    class FileUploader extends api.form.inputtype.support.BaseInputTypeManagingAdd<string> {
        protected config: api.content.form.inputtype.ContentInputTypeViewContext;
        protected uploaderEl: FileUploaderEl<any>;
        protected uploaderWrapper: api.dom.DivEl;
        protected uploadButton: api.dom.DivEl;
        constructor(config: api.content.form.inputtype.ContentInputTypeViewContext);
        getContext(): api.content.form.inputtype.ContentInputTypeViewContext;
        getValueType(): ValueType;
        newInitialValue(): Value;
        update(propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        protected setFileNameProperty(fileName: string): void;
        protected getValueFromPropertyArray(propertyArray: PropertyArray): string;
        protected getFileNamesFromProperty(propertyArray: PropertyArray): string[];
        protected createUploaderWrapper(): api.dom.DivEl;
        protected createUploader(property: Property): UploaderEl<any>;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.content.form.inputtype.upload {
    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    interface MediaUploaderConfigAllowType {
        name: string;
        extensions: string;
    }
    class MediaUploader extends api.form.inputtype.support.BaseInputTypeSingleOccurrence<string> {
        private config;
        private mediaUploaderEl;
        private uploaderWrapper;
        private svgImage;
        constructor(config: api.content.form.inputtype.ContentInputTypeViewContext);
        getContext(): api.content.form.inputtype.ContentInputTypeViewContext;
        getValueType(): ValueType;
        newInitialValue(): Value;
        layoutProperty(input: api.form.Input, property: Property): wemQ.Promise<void>;
        validate(silent?: boolean): api.form.inputtype.InputValidationRecording;
        updateProperty(property: Property, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        private manageSVGImageIfPresent(content);
        private deleteContent(property);
        private getFileNameFromProperty(property);
        private getFileExtensionFromFileName(fileName);
        private propertyAlreadyHasAttachment(property);
        private getAllowTypeFromFileName(fileName);
        private createSvgImageWrapperIfNeeded();
        private createUploaderWrapper(property);
        private createUploader(property);
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.content.form.inputtype.upload {
    import PropertyArray = api.data.PropertyArray;
    import FileUploaderEl = api.ui.uploader.FileUploaderEl;
    class AttachmentUploader extends FileUploader {
        private attachmentNames;
        constructor(config: api.content.form.inputtype.ContentInputTypeViewContext);
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        giveFocus(): boolean;
        protected getNumberOfValids(): number;
        protected createUploader(): FileUploaderEl<any>;
        private removeItemCallback(itemName);
        private addItemCallback(itemName);
        private updateOccurrences();
    }
}
declare module api.content.form.inputtype.contentselector {
    import ContentSummaryPreLoader = api.content.resource.ContentSummaryPreLoader;
    import ContentSelectorQueryRequest = api.content.resource.ContentSelectorQueryRequest;
    class ContentSelectorLoader extends ContentSummaryPreLoader {
        protected request: ContentSelectorQueryRequest;
        constructor(builder: Builder);
        protected createRequest(): ContentSelectorQueryRequest;
        private initRequest(builder);
        protected getRequest(): ContentSelectorQueryRequest;
        search(searchString: string): wemQ.Promise<ContentSummary[]>;
        isPartiallyLoaded(): boolean;
        resetParams(): void;
        static create(): Builder;
    }
    class Builder {
        content: ContentSummary;
        inputName: string;
        contentTypeNames: string[];
        allowedContentPaths: string[];
        relationshipType: string;
        setContent(content: ContentSummary): Builder;
        setInputName(name: string): Builder;
        setContentTypeNames(contentTypeNames: string[]): Builder;
        setAllowedContentPaths(allowedContentPaths: string[]): Builder;
        setRelationshipType(relationshipType: string): Builder;
        build(): ContentSelectorLoader;
    }
}
declare module api.content.form.inputtype.contentselector {
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import ContentInputTypeManagingAdd = api.content.form.inputtype.ContentInputTypeManagingAdd;
    class ContentSelector extends ContentInputTypeManagingAdd<api.content.ContentSummary> {
        private contentComboBox;
        private draggingIndex;
        private isFlat;
        private static contentIdBatch;
        private static loadSummariesResult;
        private static loadSummaries;
        constructor(config?: api.content.form.inputtype.ContentInputTypeViewContext);
        getContentComboBox(): ContentComboBox;
        protected getSelectedOptionsView(): ContentSelectedOptionsView;
        protected getContentPath(raw: api.content.ContentSummary): api.content.ContentPath;
        availableSizeChanged(): void;
        getValueType(): ValueType;
        newInitialValue(): Value;
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        private removePropertyWithId(id);
        update(propertyArray: api.data.PropertyArray, unchangedOnly: boolean): Q.Promise<void>;
        reset(): void;
        private static doFetchSummaries();
        private doLoadContent(contentIds);
        private setupSortable();
        private handleDnDStart(event, ui);
        private handleDnDUpdate(event, ui);
        private updateSelectedOptionStyle();
        private updateSelectedOptionIsEditable(selectedOption);
        private refreshSortable();
        protected getNumberOfValids(): number;
        protected readConfig(inputConfig: {
            [element: string]: {
                [name: string]: string;
            }[];
        }): void;
        giveFocus(): boolean;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.content.form.inputtype.principalselector {
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    class PrincipalSelector extends api.form.inputtype.support.BaseInputTypeManagingAdd<api.security.Principal> {
        private config;
        private principalTypes;
        private comboBox;
        constructor(config?: api.content.form.inputtype.ContentInputTypeViewContext);
        private readConfig(inputConfig);
        getPrincipalComboBox(): api.ui.security.PrincipalComboBox;
        getValueType(): ValueType;
        newInitialValue(): Value;
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        update(propertyArray: api.data.PropertyArray, unchangedOnly?: boolean): Q.Promise<void>;
        reset(): void;
        private createComboBox(input);
        private saveToSet(principalOption, index);
        private refreshSortable();
        protected getNumberOfValids(): number;
        static getName(): api.form.InputTypeName;
        giveFocus(): boolean;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.content.form.inputtype.image {
    class ImageSelectorSelectedOptionView extends api.ui.selector.combobox.BaseSelectedOptionView<ImageSelectorDisplayValue> {
        private static IMAGE_SIZE;
        private icon;
        private label;
        private check;
        private progress;
        private error;
        private loadMask;
        private selectionChangeListeners;
        constructor(option: api.ui.selector.Option<ImageSelectorDisplayValue>);
        setOption(option: api.ui.selector.Option<ImageSelectorDisplayValue>): void;
        private updateIconSrc(content);
        setProgress(value: number): void;
        doRender(): wemQ.Promise<boolean>;
        private showProgress();
        private showSpinner();
        private showResult();
        showError(text: string): void;
        updateProportions(): void;
        private centerVertically(el, contentHeight);
        getIcon(): api.dom.ImgEl;
        getCheckbox(): api.ui.Checkbox;
        toggleChecked(): void;
        private notifyChecked(checked);
        onChecked(listener: {
            (option: ImageSelectorSelectedOptionView, checked: boolean): void;
        }): void;
        unChecked(listener: {
            (option: ImageSelectorSelectedOptionView, checked: boolean): void;
        }): void;
    }
}
declare module api.content.form.inputtype.image {
    import Option = api.ui.selector.Option;
    import SelectedOption = api.ui.selector.combobox.SelectedOption;
    class ImageSelectorSelectedOptionsView extends api.ui.selector.combobox.BaseSelectedOptionsView<ImageSelectorDisplayValue> {
        private numberOfOptionsPerRow;
        private activeOption;
        private selection;
        private toolbar;
        private editSelectedOptionsListeners;
        private removeSelectedOptionsListeners;
        private mouseClickListener;
        private clickDisabled;
        constructor();
        private initAndAppendSelectionToolbar();
        private addOptionMovedEventHandler();
        protected handleDnDStop(event: Event, ui: JQueryUI.SortableUIParams): void;
        private temporarilyDisableClickEvent();
        removeOption(optionToRemove: Option<ImageSelectorDisplayValue>, silent?: boolean): void;
        removeSelectedOptions(options: SelectedOption<ImageSelectorDisplayValue>[]): void;
        createSelectedOption(option: Option<ImageSelectorDisplayValue>): SelectedOption<ImageSelectorDisplayValue>;
        addOption(option: Option<ImageSelectorDisplayValue>, silent?: boolean, keyCode?: number): boolean;
        private addNewOption(option, silent, keyCode?);
        updateUploadedOption(option: Option<ImageSelectorDisplayValue>): void;
        makeEmptyOption(id: string): Option<ImageSelectorDisplayValue>;
        private uncheckOthers(option);
        private removeOptionViewAndRefocus(option);
        private setActiveOption(option);
        private updateSelectionToolbarLayout();
        private getNumberOfEditableOptions();
        private resetActiveOption();
        private setOutsideClickListener();
        private handleOptionViewRendered(option, optionView);
        private handleOptionViewClicked(option, optionView);
        private handleOptionViewKeyDownEvent(event, option, optionView);
        private handleOptionViewChecked(checked, option, optionView);
        private handleOptionViewImageLoaded(optionView);
        private isFirstInRow(index);
        private isLastInRow(index);
        private isFirst(index);
        private isLast(index);
        private notifyRemoveSelectedOptions(option);
        onRemoveSelectedOptions(listener: (option: SelectedOption<ImageSelectorDisplayValue>[]) => void): void;
        unRemoveSelectedOptions(listener: (option: SelectedOption<ImageSelectorDisplayValue>[]) => void): void;
        private notifyEditSelectedOptions(option);
        onEditSelectedOptions(listener: (option: SelectedOption<ImageSelectorDisplayValue>[]) => void): void;
        unEditSelectedOptions(listener: (option: SelectedOption<ImageSelectorDisplayValue>[]) => void): void;
    }
}
declare module api.content.form.inputtype.image {
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import ContentSummary = api.content.ContentSummary;
    import ContentComboBox = api.content.form.inputtype.image.ImageContentComboBox;
    import ContentInputTypeManagingAdd = api.content.form.inputtype.ContentInputTypeManagingAdd;
    class ImageSelector extends ContentInputTypeManagingAdd<ImageSelectorDisplayValue> {
        private contentComboBox;
        private selectedOptionsView;
        private contentRequestsAllowed;
        private uploader;
        private editContentRequestListeners;
        private isFlat;
        constructor(config: api.content.form.inputtype.ContentInputTypeViewContext);
        getContentComboBox(): ImageContentComboBox;
        protected getContentPath(raw: ImageSelectorDisplayValue): api.content.ContentPath;
        private updateSelectedItemsIcons();
        getValueType(): ValueType;
        newInitialValue(): Value;
        private getRemainingOccurrences();
        private createSelectedOptionsView();
        createContentComboBox(maximumOccurrences: number, inputIconUrl: string, relationshipAllowedContentTypes: string[], inputName: string): ContentComboBox;
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        private removePropertyWithId(id);
        update(propertyArray: PropertyArray, unchangedOnly?: boolean): wemQ.Promise<void>;
        reset(): void;
        private createUploader();
        private doLoadContent(propertyArray);
        protected getNumberOfValids(): number;
        giveFocus(): boolean;
        private setContentIdProperty(contentId);
        protected readConfig(inputConfig: {
            [element: string]: {
                [name: string]: string;
            }[];
        }): void;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        onEditContentRequest(listener: (content: ContentSummary) => void): void;
        unEditContentRequest(listener: (content: ContentSummary) => void): void;
        private notifyEditContentRequested(content);
    }
}
declare module api.content.form.inputtype.image {
    class UploadDialogCancelAction extends api.ui.Action {
        constructor();
    }
}
declare module api.content.form.inputtype.image {
    class SelectionToolbar extends api.dom.DivEl {
        private editButton;
        private removeButton;
        private removableCount;
        private editableCount;
        private editClickListeners;
        private removeClickListeners;
        constructor();
        setSelectionCount(removableCount: number, editableCount: number): void;
        private refreshUI();
        notifyEditClicked(): void;
        onEditClicked(listener: {
            (): void;
        }): void;
        unEditClicked(listener: {
            (): void;
        }): void;
        notifyRemoveClicked(): void;
        onRemoveClicked(listener: {
            (): void;
        }): void;
        unRemoveClicked(listener: {
            (): void;
        }): void;
    }
}
declare module api.content.form.inputtype.image {
    class FocusChangedEvent {
        private focused;
        constructor(focused: boolean);
        isFocused(): boolean;
    }
}
declare module api.content.form.inputtype.image {
    import ContentSummary = api.content.ContentSummary;
    import UploadItem = api.ui.uploader.UploadItem;
    class ImageSelectorDisplayValue {
        private uploadItem;
        private content;
        private empty;
        static fromUploadItem(item: UploadItem<ContentSummary>): ImageSelectorDisplayValue;
        static fromContentSummary(content: ContentSummary): ImageSelectorDisplayValue;
        static makeEmpty(): ImageSelectorDisplayValue;
        isEmptyContent(): boolean;
        setEmpty(value: boolean): ImageSelectorDisplayValue;
        setUploadItem(item: UploadItem<ContentSummary>): ImageSelectorDisplayValue;
        setContentSummary(contentSummary: ContentSummary): ImageSelectorDisplayValue;
        getUploadItem(): UploadItem<ContentSummary>;
        getContentSummary(): ContentSummary;
        getId(): string;
        getContentId(): api.content.ContentId;
        getContentPath(): api.content.ContentPath;
        getImageUrl(): string;
        getLabel(): string;
        getDisplayName(): string;
        getTypeLocaleName(): string;
        getPath(): ContentPath;
    }
}
declare module api.content.form.inputtype.image {
    class ImageSelectorViewer extends api.ui.NamesAndIconViewer<ImageSelectorDisplayValue> {
        constructor();
        resolveDisplayName(object: ImageSelectorDisplayValue): string;
        resolveUnnamedDisplayName(object: ImageSelectorDisplayValue): string;
        resolveSubName(object: ImageSelectorDisplayValue, relativePath?: boolean): string;
        resolveIconUrl(object: ImageSelectorDisplayValue): string;
    }
}
declare module api.content.form.inputtype.image {
    import Option = api.ui.selector.Option;
    import RichComboBox = api.ui.selector.combobox.RichComboBox;
    import ImageSelectorDisplayValue = api.content.form.inputtype.image.ImageSelectorDisplayValue;
    import ImageSelectorViewer = api.content.form.inputtype.image.ImageSelectorViewer;
    import ImageSelectorSelectedOptionsView = api.content.form.inputtype.image.ImageSelectorSelectedOptionsView;
    import ContentQueryResultJson = api.content.json.ContentQueryResultJson;
    import ContentSummaryJson = api.content.json.ContentSummaryJson;
    import BaseLoader = api.util.loader.BaseLoader;
    import OptionDataLoader = api.ui.selector.OptionDataLoader;
    class ImageContentComboBox extends RichComboBox<ImageSelectorDisplayValue> {
        constructor(builder: ImageContentComboBoxBuilder);
        createOption(value: ContentSummary): Option<ImageSelectorDisplayValue>;
        static create(): ImageContentComboBoxBuilder;
    }
    class ImageContentComboBoxBuilder {
        name: string;
        maximumOccurrences: number;
        loader: BaseLoader<ContentQueryResultJson<ContentSummaryJson>, ContentSummary>;
        minWidth: number;
        selectedOptionsView: ImageSelectorSelectedOptionsView;
        optionDisplayValueViewer: ImageSelectorViewer;
        optionDataLoader: OptionDataLoader<any>;
        treegridDropdownEnabled: boolean;
        value: string;
        setName(value: string): ImageContentComboBoxBuilder;
        setValue(value: string): ImageContentComboBoxBuilder;
        setMaximumOccurrences(maximumOccurrences: number): ImageContentComboBoxBuilder;
        setLoader(loader: BaseLoader<ContentQueryResultJson<ContentSummaryJson>, ContentSummary>): ImageContentComboBoxBuilder;
        setMinWidth(value: number): ImageContentComboBoxBuilder;
        setSelectedOptionsView(value: ImageSelectorSelectedOptionsView): ImageContentComboBoxBuilder;
        setOptionDisplayValueViewer(value: ImageSelectorViewer): ImageContentComboBoxBuilder;
        setOptionDataLoader(value: OptionDataLoader<any>): ImageContentComboBoxBuilder;
        setTreegridDropdownEnabled(value: boolean): ImageContentComboBoxBuilder;
        build(): ImageContentComboBox;
    }
}
declare module api.content.form.inputtype.image {
    import ContentSummaryPreLoader = api.content.resource.ContentSummaryPreLoader;
    class ImageSelectorLoader extends ContentSummaryPreLoader {
        private imageSelectorQueryRequest;
        constructor(builder: Builder);
        search(searchString: string): wemQ.Promise<ContentSummary[]>;
        isPartiallyLoaded(): boolean;
        resetParams(): void;
        static create(): Builder;
    }
    class Builder {
        content: ContentSummary;
        inputName: string;
        contentTypeNames: string[];
        allowedContentPaths: string[];
        relationshipType: string;
        setContent(content: ContentSummary): Builder;
        setInputName(name: string): Builder;
        setContentTypeNames(contentTypeNames: string[]): Builder;
        setAllowedContentPaths(allowedContentPaths: string[]): Builder;
        setRelationshipType(relationshipType: string): Builder;
        build(): ImageSelectorLoader;
    }
}
declare module api.content {
    import OptionDataLoaderData = api.ui.selector.OptionDataLoaderData;
    import ContentTreeSelectorItem = api.content.resource.ContentTreeSelectorItem;
    class ImageOptionDataLoader extends ContentSummaryOptionDataLoader {
        protected createOptionData(data: ContentTreeSelectorItem[]): OptionDataLoaderData<ImageTreeSelectorItem>;
        static create(): ImageOptionDataLoaderBuilder;
    }
    class ImageOptionDataLoaderBuilder extends ContentSummaryOptionDataLoaderBuilder {
        inputName: string;
        setInputName(value: string): ImageOptionDataLoaderBuilder;
        setContentTypeNames(value: string[]): ImageOptionDataLoaderBuilder;
        setAllowedContentPaths(value: string[]): ImageOptionDataLoaderBuilder;
        setRelationshipType(value: string): ImageOptionDataLoaderBuilder;
        setContent(value: ContentSummary): ImageOptionDataLoaderBuilder;
        build(): ImageOptionDataLoader;
    }
    class ImageTreeSelectorItem extends ContentTreeSelectorItem {
        private imageSelectorDisplayValue;
        constructor(content: ContentSummary, expand: boolean);
        getImageUrl(): string;
        isEmptyContent(): boolean;
        getContentSummary(): ContentSummary;
    }
}
declare module api.content.form.inputtype.tag {
    import PropertyPath = api.data.PropertyPath;
    class ContentTagSuggesterBuilder {
        dataPath: PropertyPath;
        setDataPath(value: PropertyPath): ContentTagSuggesterBuilder;
        build(): ContentTagSuggester;
    }
    class ContentTagSuggester implements api.ui.tags.TagSuggester {
        private propertyPath;
        constructor(builder: ContentTagSuggesterBuilder);
        suggest(value: string): wemQ.Promise<string[]>;
    }
}
declare module api.content.form.inputtype.tag {
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    class Tag extends api.form.inputtype.support.BaseInputTypeManagingAdd<string> {
        private context;
        private tags;
        private tagSuggester;
        constructor(context: api.content.form.inputtype.ContentInputTypeViewContext);
        private resolveDataPath(context);
        getValueType(): ValueType;
        newInitialValue(): Value;
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        update(propertyArray: api.data.PropertyArray, unchangedOnly?: boolean): Q.Promise<void>;
        reset(): void;
        protected getNumberOfValids(): number;
        giveFocus(): boolean;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
    }
}
declare module api.content.form.inputtype.geo {
    import support = api.form.inputtype.support;
    import ValueType = api.data.ValueType;
    import Value = api.data.Value;
    import Property = api.data.Property;
    class GeoPoint extends support.BaseInputTypeNotManagingAdd<api.util.GeoPoint> {
        constructor(config: api.form.inputtype.InputTypeViewContext);
        getValueType(): ValueType;
        newInitialValue(): Value;
        createInputOccurrenceElement(index: number, property: Property): api.dom.Element;
        updateInputOccurrenceElement(occurrence: api.dom.Element, property: api.data.Property, unchangedOnly: boolean): void;
        resetInputOccurrenceElement(occurrence: api.dom.Element): void;
        valueBreaksRequiredContract(value: Value): boolean;
        hasInputElementValidUserInput(inputElement: api.dom.Element): boolean;
    }
}
declare module api.content.site.inputtype.siteconfigurator {
    import PropertyArray = api.data.PropertyArray;
    import ApplicationKey = api.application.ApplicationKey;
    import SiteConfig = api.content.site.SiteConfig;
    class SiteConfigProvider {
        private propertyArray;
        private arrayChangedListeners;
        private beforeArrayChangedListeners;
        private afterArrayChangedListeners;
        constructor(propertyArray: PropertyArray);
        setPropertyArray(propertyArray: PropertyArray): void;
        getConfig(applicationKey: ApplicationKey, addMissing?: boolean): SiteConfig;
        onPropertyChanged(listener: () => void): void;
        unPropertyChanged(listener: () => void): void;
        private notifyPropertyChanged();
        onBeforePropertyChanged(listener: () => void): void;
        unBeforePropertyChanged(listener: () => void): void;
        private notifyBeforePropertyChanged();
        onAfterPropertyChanged(listener: () => void): void;
        unAfterPropertyChanged(listener: () => void): void;
        private notifyAfterPropertyChanged();
    }
}
declare module api.content.site.inputtype.siteconfigurator {
    import Option = api.ui.selector.Option;
    import FormView = api.form.FormView;
    import Application = api.application.Application;
    import ApplicationKey = api.application.ApplicationKey;
    import SiteConfig = api.content.site.SiteConfig;
    class SiteConfiguratorSelectedOptionView extends api.ui.selector.combobox.BaseSelectedOptionView<Application> {
        private application;
        private formView;
        private siteConfig;
        private editClickedListeners;
        private siteConfigFormDisplayedListeners;
        private formContext;
        private formValidityChangedHandler;
        constructor(option: Option<Application>, siteConfig: SiteConfig, formContext: api.content.form.ContentFormContext);
        doRender(): wemQ.Promise<boolean>;
        setSiteConfig(siteConfig: SiteConfig): void;
        private createEditButton();
        initAndOpenConfigureDialog(comboBoxToUndoSelectionOnCancel?: SiteConfiguratorComboBox): void;
        private revertFormViewToGivenState(formViewStateToRevertTo);
        private undoSelectionOnCancel(comboBoxToUndoSelectionOnCancel);
        private applyTemporaryConfig(tempSiteConfig);
        private makeTemporarySiteConfig();
        private createFormView(siteConfig);
        private bindValidationEvent(formView);
        private unbindValidationEvent(formView);
        getApplication(): Application;
        getSiteConfig(): SiteConfig;
        getFormView(): FormView;
        onEditClicked(listener: (event: MouseEvent) => void): void;
        unEditClicked(listener: (event: MouseEvent) => void): void;
        private notifyEditClicked(event);
        onSiteConfigFormDisplayed(listener: {
            (applicationKey: ApplicationKey): void;
        }): void;
        unSiteConfigFormDisplayed(listener: {
            (applicationKey: ApplicationKey): void;
        }): void;
        private notifySiteConfigFormDisplayed(applicationKey);
    }
}
declare module api.content.site.inputtype.siteconfigurator {
    import Application = api.application.Application;
    import ApplicationKey = api.application.ApplicationKey;
    import FormView = api.form.FormView;
    import Option = api.ui.selector.Option;
    import SelectedOption = api.ui.selector.combobox.SelectedOption;
    import BaseSelectedOptionsView = api.ui.selector.combobox.BaseSelectedOptionsView;
    class SiteConfiguratorSelectedOptionsView extends BaseSelectedOptionsView<Application> {
        private siteConfigProvider;
        private siteConfigFormDisplayedListeners;
        private formContext;
        private items;
        constructor(siteConfigProvider: SiteConfigProvider, formContext: api.content.form.ContentFormContext);
        makeEmptyOption(id: string): Option<Application>;
        createSelectedOption(option: Option<Application>): SelectedOption<Application>;
        removeOption(optionToRemove: api.ui.selector.Option<Application>, silent?: boolean): void;
        onSiteConfigFormDisplayed(listener: {
            (applicationKey: ApplicationKey, formView: FormView): void;
        }): void;
        unSiteConfigFormDisplayed(listener: {
            (applicationKey: ApplicationKey, formView: FormView): void;
        }): void;
        private notifySiteConfigFormDisplayed(applicationKey, formView);
    }
}
declare module api.content.site.inputtype.siteconfigurator {
    import FormView = api.form.FormView;
    import Application = api.application.Application;
    class SiteConfiguratorDialog extends api.ui.dialog.ModalDialog {
        static debug: boolean;
        private formView;
        private okCallback;
        private cancelCallback;
        constructor(application: Application, formView: FormView, okCallback?: () => void, cancelCallback?: () => void);
        doRender(): Q.Promise<boolean>;
        private addOkButton(okCallback);
        protected getHeaderContent(application: Application): api.app.NamesAndIconView;
        private handleSelectorsDropdowns(formView);
        private getComboboxesFromFormView(formView);
        private handleDialogClose(formView);
        private findComboboxesInElement(element, comboboxArray);
        private findComboboxInItemView(itemView, comboboxArray);
        private getComboboxFromSelectorInputView(inputView);
        private isContentOrImageOrPrincipalOrComboSelectorInput(inputView);
        show(): void;
        close(): void;
        isDirty(): boolean;
    }
}
declare module api.content.site.inputtype.siteconfigurator {
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import Application = api.application.Application;
    class SiteConfigurator extends api.form.inputtype.support.BaseInputTypeManagingAdd<Application> {
        private context;
        private readOnly;
        private comboBox;
        private siteConfigProvider;
        private formContext;
        private readOnlyPromise;
        constructor(config: api.content.form.inputtype.ContentInputTypeViewContext);
        getValueType(): ValueType;
        newInitialValue(): Value;
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        update(propertyArray: api.data.PropertyArray, unchangedOnly?: boolean): Q.Promise<void>;
        reset(): void;
        private saveToSet(siteConfig, index);
        protected getValueFromPropertyArray(propertyArray: api.data.PropertyArray): string;
        private createComboBox(input, siteConfigProvider);
        private getMatchedOption(combobox, event);
        displayValidationErrors(value: boolean): void;
        protected getNumberOfValids(): number;
        validate(silent?: boolean): api.form.inputtype.InputValidationRecording;
        giveFocus(): boolean;
    }
}
declare module api.content.site.inputtype.siteconfigurator {
    import Application = api.application.Application;
    import ApplicationKey = api.application.ApplicationKey;
    import FormView = api.form.FormView;
    class SiteConfiguratorComboBox extends api.ui.selector.combobox.RichComboBox<Application> {
        private siteConfiguratorSelectedOptionsView;
        constructor(maxOccurrences: number, siteConfigProvider: SiteConfigProvider, formContext: api.content.form.ContentFormContext, value?: string);
        getSelectedOptionViews(): SiteConfiguratorSelectedOptionView[];
        getSelectedOptionsView(): SiteConfiguratorSelectedOptionsView;
        onSiteConfigFormDisplayed(listener: {
            (applicationKey: ApplicationKey, formView: FormView): void;
        }): void;
        unSiteConfigFormDisplayed(listener: {
            (applicationKey: ApplicationKey, formView: FormView): void;
        }): void;
    }
}
declare module api.content.site.inputtype.authappselector {
    import Option = api.ui.selector.Option;
    import FormView = api.form.FormView;
    import Application = api.application.Application;
    import ApplicationKey = api.application.ApplicationKey;
    import SiteConfig = api.content.site.SiteConfig;
    class AuthApplicationSelectedOptionView extends api.ui.selector.combobox.BaseSelectedOptionView<Application> {
        private application;
        private formView;
        private siteConfig;
        private editClickedListeners;
        private siteConfigFormDisplayedListeners;
        private formContext;
        private formValidityChangedHandler;
        private readOnly;
        constructor(option: Option<Application>, siteConfig: SiteConfig, formContext: api.content.form.ContentFormContext, readOnly?: boolean);
        doRender(): wemQ.Promise<boolean>;
        setSiteConfig(siteConfig: SiteConfig): void;
        private createEditButton();
        initAndOpenConfigureDialog(comboBoxToUndoSelectionOnCancel?: AuthApplicationComboBox): void;
        private revertFormViewToGivenState(formViewStateToRevertTo);
        private undoSelectionOnCancel(comboBoxToUndoSelectionOnCancel);
        private applyTemporaryConfig(tempSiteConfig);
        private makeTemporarySiteConfig();
        private createFormView(siteConfig);
        private bindValidationEvent(formView);
        private unbindValidationEvent(formView);
        getApplication(): Application;
        getSiteConfig(): SiteConfig;
        getFormView(): FormView;
        onEditClicked(listener: (event: MouseEvent) => void): void;
        unEditClicked(listener: (event: MouseEvent) => void): void;
        private notifyEditClicked(event);
        onSiteConfigFormDisplayed(listener: {
            (applicationKey: ApplicationKey): void;
        }): void;
        unSiteConfigFormDisplayed(listener: {
            (applicationKey: ApplicationKey): void;
        }): void;
        private notifySiteConfigFormDisplayed(applicationKey);
    }
}
declare module api.content.site.inputtype.authappselector {
    import Application = api.application.Application;
    import ApplicationKey = api.application.ApplicationKey;
    import FormView = api.form.FormView;
    import Option = api.ui.selector.Option;
    import SelectedOption = api.ui.selector.combobox.SelectedOption;
    import BaseSelectedOptionsView = api.ui.selector.combobox.BaseSelectedOptionsView;
    import SiteConfigProvider = api.content.site.inputtype.siteconfigurator.SiteConfigProvider;
    class AuthApplicationSelectedOptionsView extends BaseSelectedOptionsView<Application> {
        private siteConfigProvider;
        private siteConfigFormDisplayedListeners;
        private beforeOptionCreatedListeners;
        private afterOptionCreatedListeners;
        private formContext;
        private items;
        private readOnly;
        constructor(siteConfigProvider: SiteConfigProvider, formContext: api.content.form.ContentFormContext, readOnly: boolean);
        createSelectedOption(option: Option<Application>): SelectedOption<Application>;
        removeOption(optionToRemove: api.ui.selector.Option<Application>, silent?: boolean): void;
        onSiteConfigFormDisplayed(listener: {
            (applicationKey: ApplicationKey, formView: FormView): void;
        }): void;
        unSiteConfigFormDisplayed(listener: {
            (applicationKey: ApplicationKey, formView: FormView): void;
        }): void;
        private notifySiteConfigFormDisplayed(applicationKey, formView);
        onBeforeOptionCreated(listener: () => void): void;
        unBeforeOptionCreated(listener: () => void): void;
        private notifyBeforeOptionCreated();
        onAfterOptionCreated(listener: () => void): void;
        unAfterOptionCreated(listener: () => void): void;
        private notifyAfterOptionCreated();
    }
}
declare module api.content.site.inputtype.authappselector {
    import Application = api.application.Application;
    import ApplicationKey = api.application.ApplicationKey;
    import FormView = api.form.FormView;
    import SiteConfigProvider = api.content.site.inputtype.siteconfigurator.SiteConfigProvider;
    class AuthApplicationComboBox extends api.ui.selector.combobox.RichComboBox<Application> {
        private authApplicationSelectedOptionsView;
        constructor(maxOccurrences: number, siteConfigProvider: SiteConfigProvider, formContext: api.content.form.ContentFormContext, value: string, readOnly: boolean);
        getSelectedOptionViews(): AuthApplicationSelectedOptionView[];
        onSiteConfigFormDisplayed(listener: {
            (applicationKey: ApplicationKey, formView: FormView): void;
        }): void;
        unSiteConfigFormDisplayed(listener: {
            (applicationKey: ApplicationKey, formView: FormView): void;
        }): void;
        onBeforeOptionCreated(listener: () => void): void;
        unBeforeOptionCreated(listener: () => void): void;
        onAfterOptionCreated(listener: () => void): void;
        unAfterOptionCreated(listener: () => void): void;
    }
}
declare module api.content.site.inputtype.authappselector {
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import Application = api.application.Application;
    class AuthApplicationSelector extends api.form.inputtype.support.BaseInputTypeManagingAdd<Application> {
        private context;
        private comboBox;
        private siteConfigProvider;
        private formContext;
        private readOnly;
        constructor(config: api.content.form.inputtype.ContentInputTypeViewContext);
        getValueType(): ValueType;
        newInitialValue(): Value;
        private readConfig(inputConfig);
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        update(propertyArray: api.data.PropertyArray, unchangedOnly?: boolean): Q.Promise<void>;
        reset(): void;
        private saveToSet(siteConfig, index);
        protected getValueFromPropertyArray(propertyArray: api.data.PropertyArray): string;
        private createComboBox(input, siteConfigProvider);
        displayValidationErrors(value: boolean): void;
        protected getNumberOfValids(): number;
        validate(silent?: boolean): api.form.inputtype.InputValidationRecording;
        giveFocus(): boolean;
    }
}
declare module api.content.form.inputtype.customselector {
    class CustomSelectorItem {
        id: string;
        displayName: string;
        description: string;
        iconUrl: string;
        icon: {
            data: string;
            type: string;
        };
        constructor(json: any);
        getId(): string;
    }
}
declare module api.content.form.inputtype.customselector {
    import NamesAndIconViewer = api.ui.NamesAndIconViewer;
    class CustomSelectorItemViewer extends NamesAndIconViewer<CustomSelectorItem> {
        constructor();
        resolveDisplayName(object: CustomSelectorItem): string;
        resolveSubName(object: CustomSelectorItem): string;
        resolveIconEl(object: CustomSelectorItem): api.dom.Element;
        resolveIconUrl(object: CustomSelectorItem): string;
    }
}
declare module api.content.form.inputtype.customselector {
    import ResourceRequest = api.rest.ResourceRequest;
    interface CustomSelectorResponse {
        total: number;
        count: number;
        hits: CustomSelectorItem[];
    }
    class CustomSelectorRequest extends ResourceRequest<CustomSelectorResponse, CustomSelectorItem[]> {
        static DEFAULT_SIZE: number;
        private requestPath;
        private ids;
        private query;
        private start;
        private count;
        private results;
        private loaded;
        constructor();
        setRequestPath(requestPath: string): void;
        isPartiallyLoaded(): boolean;
        resetParams(): void;
        getParams(): Object;
        getRequestPath(): api.rest.Path;
        sendAndParse(): wemQ.Promise<CustomSelectorItem[]>;
        private validateResponse(result);
        setIds(ids: string[]): CustomSelectorRequest;
        setFrom(from: number): CustomSelectorRequest;
        setSize(size: number): CustomSelectorRequest;
        setQuery(query: string): CustomSelectorRequest;
    }
}
declare module api.content.form.inputtype.customselector {
    import PostLoader = api.util.loader.PostLoader;
    class CustomSelectorLoader extends PostLoader<CustomSelectorResponse, CustomSelectorItem> {
        protected request: CustomSelectorRequest;
        constructor(requestPath: string);
        protected createRequest(): CustomSelectorRequest;
        protected getRequest(): CustomSelectorRequest;
        search(searchString: string): wemQ.Promise<CustomSelectorItem[]>;
        protected sendPreLoadRequest(ids: string): Q.Promise<CustomSelectorItem[]>;
        resetParams(): void;
        isPartiallyLoaded(): boolean;
        filterFn(item: CustomSelectorItem): boolean;
    }
}
declare module api.content.form.inputtype.customselector {
    import RichComboBox = api.ui.selector.combobox.RichComboBox;
    class CustomSelectorComboBox extends RichComboBox<CustomSelectorItem> {
        constructor(input: api.form.Input, requestPath: string, value: string);
    }
}
declare module api.content.form.inputtype.customselector {
    import PropertyArray = api.data.PropertyArray;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import RichComboBox = api.ui.selector.combobox.RichComboBox;
    class CustomSelector extends api.form.inputtype.support.BaseInputTypeManagingAdd<CustomSelectorItem> {
        static debug: boolean;
        private static portalUrl;
        private requestPath;
        private context;
        private comboBox;
        private draggingIndex;
        constructor(context: api.content.form.inputtype.ContentInputTypeViewContext);
        private readConfig(context);
        getValueType(): ValueType;
        newInitialValue(): Value;
        layout(input: api.form.Input, propertyArray: PropertyArray): wemQ.Promise<void>;
        update(propertyArray: api.data.PropertyArray, unchangedOnly?: boolean): Q.Promise<void>;
        reset(): void;
        createComboBox(input: api.form.Input, propertyArray: PropertyArray): RichComboBox<CustomSelectorItem>;
        protected getNumberOfValids(): number;
        giveFocus(): boolean;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        private setupSortable();
        private refreshSortable();
        private handleDnDStart(event, ui);
        private handleDnDUpdate(event, ui);
        private updateSelectedOptionStyle();
    }
}
declare module api.issue.event {
    import NodeServerChangeType = api.event.NodeServerChangeType;
    class IssueServerEvent extends api.event.NodeServerEvent {
        constructor(change: IssueServerChange);
        getType(): NodeServerChangeType;
        getNodeChange(): IssueServerChange;
        static is(eventJson: api.event.NodeEventJson): boolean;
        static fromJson(nodeEventJson: api.event.NodeEventJson): IssueServerEvent;
    }
}
declare module api.issue.event {
    import NodeServerChange = api.event.NodeServerChange;
    import NodeEventJson = api.event.NodeEventJson;
    import NodeServerChangeItem = api.event.NodeServerChangeItem;
    import NodeEventNodeJson = api.event.NodeEventNodeJson;
    import NodeServerChangeType = api.event.NodeServerChangeType;
    class IssueServerChangeItem extends NodeServerChangeItem<string> {
        issueId: string;
        constructor(path: string, branch: string, issueId: string);
        getIssueId(): string;
        static fromJson(node: NodeEventNodeJson): IssueServerChangeItem;
    }
    class IssueServerChange extends NodeServerChange<string> {
        constructor(type: NodeServerChangeType, changeItems: IssueServerChangeItem[], newPrincipalPaths?: string[]);
        toString(): string;
        static fromJson(nodeEventJson: NodeEventJson): IssueServerChange;
    }
}
declare module api.aggregation {
    interface AggregationTypeWrapperJson {
        BucketAggregation?: api.aggregation.BucketWrapperJson;
    }
}
declare module api.aggregation {
    class Aggregation {
        private name;
        constructor(name: string);
        getName(): string;
        static fromJsonArray(aggregationWrapperJsons: AggregationTypeWrapperJson[]): Aggregation[];
    }
}
declare module api.aggregation {
    class AggregationView extends api.dom.DivEl {
        private parentGroupView;
        private aggregation;
        private bucketSelectionChangedListeners;
        private displayNameMap;
        constructor(aggregation: api.aggregation.Aggregation, parentGroupView: api.aggregation.AggregationGroupView);
        setDisplayNamesMap(displayNameMap: {
            [name: string]: string;
        }): void;
        setDisplayNames(): void;
        getDisplayNameForName(name: string): string;
        getAggregation(): api.aggregation.Aggregation;
        getParentGroupView(): AggregationGroupView;
        getName(): string;
        deselectFacet(supressEvent?: boolean): void;
        hasSelectedEntry(): boolean;
        getSelectedValues(): api.aggregation.Bucket[];
        update(aggregation: api.aggregation.Aggregation): void;
        onBucketViewSelectionChanged(listener: (event: api.aggregation.BucketViewSelectionChangedEvent) => void): void;
        unBucketViewSelectionChanged(listener: (event: api.aggregation.BucketViewSelectionChangedEvent) => void): void;
        notifyBucketViewSelectionChanged(event: api.aggregation.BucketViewSelectionChangedEvent): void;
        static createAggregationView(aggregation: api.aggregation.Aggregation, parentGroupView: api.aggregation.AggregationGroupView): api.aggregation.AggregationView;
    }
}
declare module api.aggregation {
    class BucketAggregation extends Aggregation {
        private buckets;
        constructor(name: string);
        getBucketByName(name: string): api.aggregation.Bucket;
        getBuckets(): api.aggregation.Bucket[];
        addBucket(bucket: api.aggregation.Bucket): void;
        static fromJson(json: api.aggregation.BucketAggregationJson): BucketAggregation;
    }
}
declare module api.aggregation {
    interface BucketAggregationJson {
        name: string;
        buckets: api.aggregation.BucketWrapperJson[];
    }
}
declare module api.aggregation {
    class BucketAggregationView extends api.aggregation.AggregationView {
        private bucketAggregation;
        private bucketViews;
        private showBucketView;
        constructor(bucketAggregation: api.aggregation.BucketAggregation, parentGroupView: api.aggregation.AggregationGroupView);
        setDisplayNames(): void;
        hasSelectedEntry(): boolean;
        private addBucket(bucketView);
        getSelectedValues(): api.aggregation.Bucket[];
        deselectFacet(supressEvent?: boolean): void;
        update(aggregation: api.aggregation.Aggregation): void;
        private getSelectedBucketNames();
    }
}
declare module api.aggregation {
    class Bucket {
        key: string;
        docCount: number;
        constructor(key: string, docCount: number);
        getKey(): string;
        getDocCount(): number;
        setKey(key: string): void;
        setDocCount(docCount: number): void;
        static fromJson(json: api.aggregation.BucketJson): Bucket;
        getSelectionValue(): any;
    }
}
declare module api.aggregation {
    class BucketFactory {
        static createFromJson(json: api.aggregation.BucketWrapperJson): api.aggregation.Bucket;
    }
}
declare module api.aggregation {
    interface BucketJson {
        docCount: number;
        key: string;
    }
}
declare module api.aggregation {
    class BucketView extends api.dom.DivEl {
        private bucket;
        private checkbox;
        private parentAggregationView;
        private selectionChangedListeners;
        private displayName;
        constructor(bucket: api.aggregation.Bucket, parentAggregationView: api.aggregation.AggregationView, select: boolean, displayName?: string);
        private resolveLabelValue();
        private resolveKey();
        setDisplayName(displayName: string): void;
        private updateLabel();
        getBucket(): api.aggregation.Bucket;
        getName(): string;
        update(bucket: api.aggregation.Bucket): void;
        isSelected(): boolean;
        deselect(supressEvent?: boolean): void;
        private updateUI();
        getParentAggregationView(): AggregationView;
        notifySelectionChanged(oldValue: boolean, newValue: boolean): void;
        unSelectionChanged(listener: (event: api.aggregation.BucketViewSelectionChangedEvent) => void): void;
        onSelectionChanged(listener: (event: api.aggregation.BucketViewSelectionChangedEvent) => void): void;
    }
}
declare module api.aggregation {
    class DateRangeBucket extends Bucket {
        private from;
        private to;
        constructor(key: string, docCount: number);
        getFrom(): Date;
        getTo(): Date;
        static fromDateRangeJson(json: api.aggregation.DateRangeBucketJson): DateRangeBucket;
    }
}
declare module api.aggregation {
    interface DateRangeBucketJson extends api.aggregation.BucketJson {
        from: Date;
        to: Date;
    }
}
declare module api.aggregation {
    interface BucketWrapperJson {
        BucketJson?: api.aggregation.BucketJson;
        DateRangeBucket?: api.aggregation.DateRangeBucketJson;
    }
}
declare module api.aggregation {
    class AggregationContainer extends api.dom.DivEl {
        aggregationGroupViews: api.aggregation.AggregationGroupView[];
        private lastSelectedGroupView;
        constructor();
        addAggregationGroupView(aggregationGroupView: api.aggregation.AggregationGroupView): void;
        deselectAll(supressEvent?: boolean): void;
        hasSelectedBuckets(): boolean;
        updateAggregations(aggregations: api.aggregation.Aggregation[], doUpdateAll?: boolean): void;
        private isGroupUpdatable(aggregationGroupView);
        getSelectedValuesByAggregationName(): api.aggregation.AggregationSelection[];
    }
}
declare module api.aggregation {
    class AggregationFactory {
        static createFromJson(json: api.aggregation.AggregationTypeWrapperJson): api.aggregation.Aggregation;
    }
}
declare module api.aggregation {
    class AggregationSelection {
        name: string;
        selectedBuckets: api.aggregation.Bucket[];
        constructor(name: string);
        setValues(selectedBuckets: api.aggregation.Bucket[]): void;
        getName(): string;
        getSelectedBuckets(): api.aggregation.Bucket[];
    }
}
declare module api.aggregation {
    import AggregationSelection = api.aggregation.AggregationSelection;
    class AggregationGroupView extends api.dom.DivEl {
        private name;
        private displayName;
        private aggregationViews;
        private titleEl;
        private bucketSelectionChangedListeners;
        constructor(name: string, displayName: string);
        private addAggregationView(aggregationView);
        initialize(): void;
        getAggregationViews(): api.aggregation.AggregationView[];
        getName(): string;
        handlesAggregation(aggregation: api.aggregation.Aggregation): boolean;
        getSelectedValuesByAggregationName(): AggregationSelection[];
        hasSelections(): boolean;
        deselectGroup(supressEvent?: boolean): void;
        onBucketViewSelectionChanged(listener: (event: api.aggregation.BucketViewSelectionChangedEvent) => void): void;
        unBucketViewSelectionChanged(listener: (event: api.aggregation.BucketViewSelectionChangedEvent) => void): void;
        notifyBucketViewSelectionChanged(event: api.aggregation.BucketViewSelectionChangedEvent): void;
        update(aggregations: api.aggregation.Aggregation[]): void;
        private getAggregationView(name);
    }
}
declare module api.aggregation {
    class ContentTypeAggregationGroupView extends AggregationGroupView {
        initialize(): void;
    }
}
declare module api.aggregation {
    class AggregationEntryViewSelectionChangedEvent {
        private oldValue;
        private newValue;
        private bucketView;
        constructor(oldValue: boolean, newValue: boolean, bucketView: BucketView);
        getOldValue(): boolean;
        getNewValue(): boolean;
        getBucketView(): BucketView;
    }
}
declare module api.aggregation {
    class BucketViewSelectionChangedEvent {
        private oldValue;
        private newValue;
        private bucketView;
        constructor(oldValue: boolean, newValue: boolean, bucketView: api.aggregation.BucketView);
        getOldValue(): boolean;
        getNewValue(): boolean;
        getBucketView(): api.aggregation.BucketView;
    }
}
declare module api.aggregation {
    class PrincipalAggregationGroupView extends AggregationGroupView {
        initialize(): void;
    }
}
declare module api.rendering {
    enum RenderingMode {
        EDIT = 0,
        PREVIEW = 1,
        LIVE = 2,
        ADMIN = 3,
    }
}
declare module api.rendering {
    class UriHelper {
        static getPortalUri(path: string, renderingMode: RenderingMode, workspace: api.content.Branch): string;
        static getPathFromPortalPreviewUri(portalUri: string, renderingMode: RenderingMode, workspace: api.content.Branch): string;
        static getComponentUri(contentId: string, componentPath: api.content.page.region.ComponentPath, renderingMode: RenderingMode, workspace: api.content.Branch): string;
        static getAdminUri(baseUrl: string, contentPath: string): string;
    }
}
declare module api.app {
    class ShowAppLauncherEvent extends api.event.Event {
        private application;
        private sessionExpired;
        constructor(application: Application, sessionExpired?: boolean);
        getApplication(): Application;
        isSessionExpired(): boolean;
        static on(handler: (event: ShowAppLauncherEvent) => void): void;
    }
}
declare module api.app {
    class ShowBrowsePanelEvent extends api.event.Event {
        static on(handler: (event: ShowBrowsePanelEvent) => void): void;
        static un(handler?: (event: ShowBrowsePanelEvent) => void): void;
    }
}
declare module api.app {
    class NamesView extends api.dom.DivEl {
        private mainNameEl;
        private subNameEl;
        private addTitleAttribute;
        constructor(addTitleAttribute?: boolean);
        setMainName(value: string, escapeHtml?: boolean): NamesView;
        setSubName(value: string, title?: string): NamesView;
        setSubNameElements(elements: api.dom.Element[]): NamesView;
    }
}
declare module api.app {
    enum NamesAndIconViewSize {
        large = 0,
        medium = 1,
        small = 2,
    }
}
declare module api.app {
    class NamesAndIconViewBuilder {
        size: NamesAndIconViewSize;
        addTitleAttribute: boolean;
        appendIcon: boolean;
        setSize(size: NamesAndIconViewSize): NamesAndIconViewBuilder;
        setAddTitleAttribute(addTitleAttribute: boolean): NamesAndIconViewBuilder;
        setAppendIcon(appendIcon: boolean): NamesAndIconViewBuilder;
        build(): NamesAndIconView;
    }
    class NamesAndIconView extends api.dom.DivEl {
        private wrapperDivEl;
        private iconImageEl;
        private iconDivEl;
        private iconEl;
        private namesView;
        private iconLabelEl;
        constructor(builder: NamesAndIconViewBuilder);
        setMainName(value: string): NamesAndIconView;
        setSubName(value: string, title?: string): NamesAndIconView;
        setSubNameElements(elements: api.dom.Element[]): NamesAndIconView;
        setIconClass(value: string): NamesAndIconView;
        setIconUrl(value: string): NamesAndIconView;
        setIconEl(value: api.dom.Element): NamesAndIconView;
        setDisplayIconLabel(display: boolean): NamesAndIconView;
        getNamesView(): api.app.NamesView;
        /**
         * protected, to be used by inheritors
         */
        getIconImageEl(): api.dom.ImgEl;
        /**
         * protected, to be used by inheritors
         */
        getWrapperDivEl(): api.dom.DivEl;
        setIconToolTip(toolTip: string): void;
        static create(): NamesAndIconViewBuilder;
    }
}
declare module api.app {
    enum ApplicationShowStatus {
        NOT_DISPLAYED = 0,
        PREPARING = 1,
        DISPLAYED = 2,
    }
    class Application {
        private id;
        private name;
        private shortName;
        private iconUrl;
        private fullSizeIcon;
        private openTabs;
        private status;
        private loaded;
        private path;
        private loadedListeners;
        private window;
        constructor(id: string, name: string, shortName: string, icon: string, appFrame?: api.dom.IFrameEl, iconImage?: boolean);
        static getApplication(): api.app.Application;
        static getAppId(): string;
        isLoaded(): boolean;
        getId(): string;
        getName(): string;
        getShortName(): string;
        getIconUrl(): string;
        getOpenTabs(): number;
        getWindow(): Window;
        setWindow(window: Window): void;
        isFullSizeIcon(): boolean;
        hide(): void;
        show(): void;
        setOpenTabs(value: number): Application;
        setLoaded(value: boolean): Application;
        setDisplayingStatus(status: ApplicationShowStatus): void;
        setFullSizeIcon(value: boolean): Application;
        setPath(path: api.rest.Path): Application;
        getPath(): api.rest.Path;
        isDisplayed(): boolean;
        isPreparing(): boolean;
        isNotDisplayed(): boolean;
        onLoaded(listener: () => void): void;
        unLoaded(listener: () => void): void;
        private notifyLoaded();
    }
}
declare module api.app {
    enum AppLauncherEventType {
        Show = 0,
    }
}
declare module api.app {
    interface AppLauncherEvent {
        appLauncherEvent: string;
    }
}
declare module api.app {
    class AppPanel<M extends api.Equitable> extends api.ui.panel.DeckPanel {
        protected browsePanel: api.app.browse.BrowsePanel<M>;
        protected currentKeyBindings: api.ui.KeyBinding[];
        constructor(className?: string);
        private handlePanelShown(event);
        protected handleGlobalEvents(): void;
        protected handleBrowse(event: ShowBrowsePanelEvent): void;
        protected addBrowsePanel(browsePanel: api.app.browse.BrowsePanel<M>): void;
        protected activateCurrentKeyBindings(): void;
        protected createBrowsePanel(): api.app.browse.BrowsePanel<M>;
    }
}
declare module api.app {
    import NavigationItem = api.ui.NavigationItem;
    import Panel = api.ui.panel.Panel;
    import AppBarTabMenuItem = api.app.bar.AppBarTabMenuItem;
    class NavigatedAppPanel<M extends api.Equitable> extends AppPanel<M> {
        private appBarTabMenu;
        private appBar;
        constructor(appBar: api.app.bar.TabbedAppBar);
        selectPanel(item: NavigationItem): void;
        selectPanelByIndex(index: number): void;
        addNavigablePanel(item: AppBarTabMenuItem, panel: Panel, select?: boolean): number;
        removeNavigablePanel(panel: Panel, checkCanRemovePanel?: boolean): number;
        getAppBarTabMenu(): api.app.bar.AppBarTabMenu;
        addViewPanel(tabMenuItem: api.app.bar.AppBarTabMenuItem, viewPanel: api.app.view.ItemViewPanel<M>): void;
        addWizardPanel(tabMenuItem: api.app.bar.AppBarTabMenuItem, wizardPanel: api.app.wizard.WizardPanel<any>): void;
        canRemovePanel(panel: api.ui.panel.Panel): boolean;
        protected addBrowsePanel(browsePanel: api.app.browse.BrowsePanel<M>): void;
        protected resolveActions(panel: api.ui.panel.Panel): api.ui.Action[];
        private checkBrowsePanelNeedsToBeShown(index, panel);
    }
}
declare module api.app {
    class AppManager {
        private static INSTANCE;
        private connectionLostListeners;
        private connectionRestoredListeners;
        private showLauncherListeners;
        constructor();
        onConnectionLost(listener: () => void): void;
        onConnectionRestored(listener: () => void): void;
        unConnectionLost(listener: () => void): void;
        unConnectionRestored(listener: () => void): void;
        notifyConnectionLost(): void;
        notifyConnectionRestored(): void;
        static instance(): api.app.AppManager;
    }
}
declare module api.app {
    class ServerEventsConnection {
        private static INSTANCE;
        private static KEEP_ALIVE_TIME;
        private ws;
        private reconnectInterval;
        private serverEventReceivedListeners;
        private connectionLostListeners;
        private connectionRestoredListeners;
        private connected;
        private disconnectTimeoutHandle;
        private keepConnected;
        private downTime;
        private keepAliveIntervalId;
        static debug: boolean;
        constructor(reconnectIntervalSeconds?: number);
        static getInstance(): ServerEventsConnection;
        connect(): void;
        private doConnect(wsUrl);
        disconnect(): void;
        isConnected(): boolean;
        private handleServerEvent(eventJson);
        private translateServerEvent(eventJson);
        private getWebSocketUriPrefix();
        private notifyServerEvent(serverEvent);
        onServerEvent(listener: (event: api.event.Event) => void): void;
        unServerEvent(listener: (event: api.event.Event) => void): void;
        private notifyConnectionLost();
        onConnectionLost(listener: () => void): void;
        unConnectionLost(listener: () => void): void;
        private notifyConnectionRestored();
        onConnectionRestored(listener: () => void): void;
        unConnectionRestored(listener: () => void): void;
    }
}
declare module api.app {
    class ServerEventsListener {
        private serverEventsConnection;
        private applications;
        private aggregator;
        constructor(applications: api.app.Application[]);
        start(): void;
        stop(): void;
        onConnectionLost(listener: () => void): void;
        unConnectionLost(listener: () => void): void;
        onConnectionRestored(listener: () => void): void;
        unConnectionRestored(listener: () => void): void;
        private onServerEvent(event);
        private fireEvent(event);
    }
}
declare module api.app {
    import NodeServerEvent = api.event.NodeServerEvent;
    import NodeServerChangeType = api.event.NodeServerChangeType;
    class ServerEventAggregator {
        private static AGGREGATION_TIMEOUT;
        private events;
        private type;
        private batchReadyListeners;
        private debouncedNotification;
        constructor();
        getEvents(): NodeServerEvent[];
        resetEvents(): void;
        appendEvent(event: NodeServerEvent): void;
        getType(): NodeServerChangeType;
        private isTheSameTypeEvent(event);
        private init(event);
        onBatchIsReady(listener: (event: any) => void): void;
        unBatchIsReady(listener: (event: any) => void): void;
        private notifyBatchIsReady();
    }
}
declare module api.app.bar {
    class ShowAppLauncherAction extends api.ui.Action {
        constructor(application: api.app.Application);
    }
}
declare module api.app.bar {
    class ShowBrowsePanelAction extends api.ui.Action {
        constructor();
    }
}
declare module api.app.bar {
    class AppBarActions {
        static SHOW_BROWSE_PANEL: api.ui.Action;
    }
}
declare module api.app.bar {
    class AppBar extends api.dom.DivEl implements api.ui.ActionContainer {
        protected application: Application;
        private appIcon;
        private showAppLauncherAction;
        constructor(application: Application);
        getActions(): api.ui.Action[];
        setHomeIconAction(): void;
    }
    class AppIcon extends api.dom.DivEl {
        constructor(app: Application, action?: api.ui.Action);
        setAction(action: api.ui.Action): void;
    }
}
declare module api.app.bar {
    class AppBarTabId {
        private mode;
        private id;
        static forNew(id?: string): AppBarTabId;
        static forEdit(id: string): AppBarTabId;
        static forView(id: string): AppBarTabId;
        constructor(mode: string, id: string);
        getId(): string;
        changeToEditMode(id: string): void;
        equals(other: AppBarTabId): boolean;
        toString(): string;
    }
}
declare module api.app.bar {
    class AppBarTabMenu extends api.ui.tab.TabMenu {
        static TAB_WIDTH: number;
        static MAX_WIDTH: number;
        private appBarTabMenuButton;
        private barEl;
        private buttonLabelChangedListeners;
        private timeoutHandler;
        constructor();
        private updateTabMenuButtonVisibility();
        private moveTabs(timeout?);
        private moveTabsHandler();
        protected createTabMenuButton(): AppBarTabMenuButton;
        protected setButtonLabel(value: string): AppBarTabMenu;
        protected handleClick(e: MouseEvent): void;
        addNavigationItem(tab: AppBarTabMenuItem): void;
        removeNavigationItem(tab: AppBarTabMenuItem): void;
        getNavigationItemById(tabId: AppBarTabId): AppBarTabMenuItem;
        getNavigationItemByIdValue(tabIdValue: string): AppBarTabMenuItem;
        selectNavigationItem(tabIndex: number): void;
        private makeSelectedTabFirst(tab);
        private makeTabFirst(tab);
        deselectNavigationItem(): void;
        onButtonLabelChanged(listener: () => void): void;
        unButtonLabelChanged(listener: () => void): void;
        private notifyButtonLabelChanged();
    }
}
declare module api.app.bar {
    class AppBarTabMenuButton extends api.ui.tab.TabMenuButton {
        private tabCountEl;
        constructor();
        setTabCount(value: number): void;
        setEditing(editing: boolean): void;
    }
    class AppBarTabCount extends api.dom.SpanEl {
        constructor();
        setCount(value: number): void;
    }
}
declare module api.app.bar {
    class AppBarTabMenuItem extends api.ui.tab.TabMenuItem {
        private tabId;
        private editing;
        constructor(builder: AppBarTabMenuItemBuilder);
        isEditing(): boolean;
        getTabId(): AppBarTabId;
        setTabId(tabId: AppBarTabId): void;
    }
    class AppBarTabMenuItemBuilder extends api.ui.tab.TabMenuItemBuilder {
        tabId: AppBarTabId;
        editing: boolean;
        constructor();
        setLabel(label: string): AppBarTabMenuItemBuilder;
        setTabId(tabId: AppBarTabId): AppBarTabMenuItemBuilder;
        setEditing(editing: boolean): AppBarTabMenuItemBuilder;
        setCloseAction(closeAction: api.ui.Action): AppBarTabMenuItemBuilder;
        setMarkUnnamed(markUnnamed: boolean): AppBarTabMenuItemBuilder;
        setMarkInvalid(markInvalid: boolean): AppBarTabMenuItemBuilder;
        build(): AppBarTabMenuItem;
    }
}
declare module api.app.bar {
    class TabbedAppBar extends AppBar implements api.ui.ActionContainer {
        private tabMenu;
        constructor(application: Application);
        private updateAppOpenTabs();
        getTabMenu(): AppBarTabMenu;
    }
}
declare module api.app.browse.action {
    import Action = api.ui.Action;
    class ToggleFilterPanelAction extends Action {
        constructor(browsePanel: BrowsePanel<any>);
    }
}
declare module api.app.browse.action {
    import Action = api.ui.Action;
    import TreeGrid = api.ui.treegrid.TreeGrid;
    class ShowAllAction<DATA> extends Action {
        constructor(show: () => void, treeGrid: TreeGrid<DATA>);
        private createLabel(treeGrid);
    }
}
declare module api.app.browse {
    import TreeNode = api.ui.treegrid.TreeNode;
    import BrowseItem = api.app.browse.BrowseItem;
    import TreeGridActions = api.ui.treegrid.actions.TreeGridActions;
    class BrowsePanel<M extends api.Equitable> extends api.ui.panel.Panel implements api.ui.ActionContainer {
        private static SPLIT_PANEL_ALIGNMENT_TRESHOLD;
        protected browseToolbar: api.ui.toolbar.Toolbar;
        protected treeGrid: api.ui.treegrid.TreeGrid<Object>;
        protected filterPanel: api.app.browse.filter.BrowseFilterPanel<Object>;
        private gridAndToolbarPanel;
        private browseItemPanel;
        private gridAndItemsSplitPanel;
        private filterAndGridSplitPanel;
        private filterPanelForcedShown;
        private filterPanelForcedHidden;
        protected filterPanelToBeShownFullScreen: boolean;
        private filterPanelIsHiddenByDefault;
        private toggleFilterPanelAction;
        private toggleFilterPanelButton;
        constructor();
        protected updateFilterPanelOnSelectionChange(): void;
        private toggleSelectionMode(isActive);
        protected enableSelectionMode(): void;
        protected disableSelectionMode(): void;
        protected checkIfItemIsRenderable(browseItem: BrowseItem<M>): wemQ.Promise<boolean>;
        private onHighlightingChanged(node);
        protected createToolbar(): api.ui.toolbar.Toolbar;
        protected createTreeGrid(): api.ui.treegrid.TreeGrid<Object>;
        protected createBrowseItemPanel(): BrowseItemPanel<M>;
        protected getBrowseActions(): TreeGridActions<M>;
        protected createFilterPanel(): api.app.browse.filter.BrowseFilterPanel<M>;
        doRender(): wemQ.Promise<boolean>;
        getFilterAndGridSplitPanel(): api.ui.panel.Panel;
        getTreeGrid(): api.ui.treegrid.TreeGrid<Object>;
        getBrowseItemPanel(): BrowseItemPanel<M>;
        getActions(): api.ui.Action[];
        treeNodesToBrowseItems(nodes: TreeNode<Object>[]): BrowseItem<M>[];
        refreshFilter(): void;
        setRefreshOfFilterRequired(): void;
        toggleFilterPanel(): void;
        private filterPanelIsHidden();
        protected showFilterPanel(): void;
        protected hideFilterPanel(): void;
        private setupFilterPanel();
        private addToggleFilterPanelButtonInToolbar();
        private checkFilterPanelToBeShownFullScreen(item);
        private toggleFilterPanelDependingOnScreenSize(item);
        private togglePreviewPanelDependingOnScreenSize(item);
        private updateSelectionModeShownItems(currentSelection, fullSelection);
    }
}
declare module api.app.browse {
    class BrowseItem<M extends api.Equitable> implements api.Equitable {
        private model;
        private id;
        private displayName;
        private path;
        private iconUrl;
        private iconClass;
        private renderable;
        constructor(model: M);
        setId(value: string): api.app.browse.BrowseItem<M>;
        setDisplayName(value: string): api.app.browse.BrowseItem<M>;
        setPath(value: string): api.app.browse.BrowseItem<M>;
        setIconUrl(value: string): api.app.browse.BrowseItem<M>;
        setIconClass(iconClass: string): api.app.browse.BrowseItem<M>;
        setRenderable(value: boolean): api.app.browse.BrowseItem<M>;
        getIconClass(): string;
        getModel(): M;
        getId(): string;
        getDisplayName(): string;
        getPath(): string;
        getIconUrl(): string;
        isRenderable(): boolean;
        toViewItem(): api.app.view.ViewItem<M>;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.app.browse {
    class SelectionItem<M extends api.Equitable> extends api.dom.DivEl {
        private viewer;
        protected item: BrowseItem<M>;
        protected removeEl: api.dom.DivEl;
        private removeListeners;
        constructor(viewer: api.ui.Viewer<M>, item: BrowseItem<M>);
        doRender(): Q.Promise<boolean>;
        private initRemoveButton(callback?);
        onRemoveClicked(listener: (event: MouseEvent) => void): void;
        unRemoveClicked(listener: (event: MouseEvent) => void): void;
        notifyRemoveClicked(event: MouseEvent): void;
        setBrowseItem(item: BrowseItem<M>): void;
        getBrowseItem(): BrowseItem<M>;
        hideRemoveButton(): void;
        getRemoveButton(): api.dom.Element;
    }
}
declare module api.app.browse {
    class BrowseItemPanel<M extends api.Equitable> extends api.ui.panel.DeckPanel {
        private itemStatisticsPanel;
        private items;
        private noSelectionContainer;
        constructor();
        createItemStatisticsPanel(): api.app.view.ItemStatisticsPanel<M>;
        togglePreviewForItem(item?: BrowseItem<M>): void;
        updatePreviewPanel(): void;
        private showNoSelectionMessage();
        setStatisticsItem(item: BrowseItem<M>): void;
        getStatisticsItem(): api.app.view.ViewItem<M>;
        private addItem(item);
        private removeItem(item);
        updateItems(items: BrowseItem<M>[]): void;
        getItems(): BrowseItem<M>[];
        setItems(items: BrowseItem<M>[]): BrowseItemsChanges<M>;
        private indexOf(item);
        protected compareItems(currentItem: BrowseItem<M>, updatedItem: BrowseItem<M>): boolean;
    }
}
declare module api.app.browse {
    class ItemDeselectedEvent<M extends api.Equitable> {
        private browseItem;
        constructor(browseItem: BrowseItem<M>);
        getBrowseItem(): BrowseItem<M>;
    }
}
declare module api.app.browse {
    class BrowseItemsChanges<M extends api.Equitable> {
        private added;
        private removed;
        constructor(added?: BrowseItem<M>[], removed?: BrowseItem<M>[]);
        setAdded(added: BrowseItem<M>[]): void;
        getAdded(): BrowseItem<M>[];
        setRemoved(removed: BrowseItem<M>[]): void;
        getRemoved(): BrowseItem<M>[];
    }
}
declare module api.app.browse.filter {
    class BrowseFilterPanel<T> extends api.ui.panel.Panel {
        private searchStartedListeners;
        private hideFilterPanelButtonClickedListeners;
        private showResultsButtonClickedListeners;
        private aggregationContainer;
        private searchField;
        private clearFilter;
        private hitsCounterEl;
        private hideFilterPanelButton;
        private showResultsButton;
        protected filterPanelRefreshNeeded: boolean;
        private refreshStartedListeners;
        protected selectionSection: ConstraintSection<T>;
        constructor();
        protected getGroupViews(): api.aggregation.AggregationGroupView[];
        protected appendExtraSections(): void;
        protected appendSelectedItemsSection(): void;
        protected getSelectionItems(): T[];
        setConstraintItems(constraintSection: ConstraintSection<T>, items: T[]): void;
        setSelectedItems(items: T[]): void;
        hasConstraint(): boolean;
        protected createConstraintSection(): api.app.browse.filter.ConstraintSection<T>;
        protected onCloseFilterInConstrainedMode(): void;
        setRefreshOfFilterRequired(): void;
        giveFocusToSearch(): void;
        updateAggregations(aggregations: api.aggregation.Aggregation[], doUpdateAll?: boolean): void;
        getSearchInputValues(): api.query.SearchInputValues;
        hasFilterSet(): boolean;
        protected isFilteredOrConstrained(): boolean;
        hasSearchStringSet(): boolean;
        search(elementChanged?: api.dom.Element): void;
        doSearch(elementChanged?: api.dom.Element): void;
        refresh(): void;
        doRefresh(): void;
        resetConstraints(): void;
        reset(suppressEvent?: boolean): void;
        resetControls(): void;
        protected resetFacets(suppressEvent?: boolean, doResetAll?: boolean): void;
        deselectAll(): void;
        onSearchStarted(listener: () => void): void;
        onRefreshStarted(listener: () => void): void;
        unRefreshStarted(listener: () => void): void;
        unSearchStarted(listener: () => void): void;
        onHideFilterPanelButtonClicked(listener: () => void): void;
        onShowResultsButtonClicked(listener: () => void): void;
        private notifySearchStarted();
        protected notifyRefreshStarted(): void;
        private notifyHidePanelButtonPressed();
        private notifyShowResultsButtonPressed();
        updateHitsCounter(hits: number, emptyFilterValue?: boolean): void;
        updateResultsTitle(allShown: boolean): void;
    }
    class ConstraintSection<T> extends api.dom.DivEl {
        private label;
        protected items: T[];
        constructor(label: string, closeCallback?: () => void);
        private appendCloseButton(closeCallback);
        reset(): void;
        getItems(): T[];
        private checkVisibilityState();
        isActive(): boolean;
        setItems(items: T[]): void;
        protected setLabel(text: string): void;
    }
}
declare module api.app.browse.filter {
    class TextSearchField extends api.dom.InputEl {
        private timerId;
        constructor(placeholder?: string);
        clear(silent?: boolean): void;
        protected handleInput(): void;
    }
}
declare module api.app.browse.filter {
    class ClearFilterButton extends api.dom.AEl {
        constructor();
    }
}
declare module api.app.browse.filter {
    class BrowseFilterSearchEvent<DATA> extends api.event.Event {
        private data;
        constructor(data: DATA);
        getData(): DATA;
        static on(handler: (event: BrowseFilterSearchEvent<any>) => void): void;
        static un(handler?: (event: BrowseFilterSearchEvent<any>) => void): void;
    }
}
declare module api.app.browse.filter {
    class BrowseFilterResetEvent extends api.event.Event {
        static on(handler: (event: BrowseFilterResetEvent) => void): void;
        static un(handler?: (event: BrowseFilterResetEvent) => void): void;
    }
}
declare module api.app.browse.filter {
    class BrowseFilterRefreshEvent extends api.event.Event {
        static on(handler: (event: BrowseFilterRefreshEvent) => void): void;
        static un(handler?: (event: BrowseFilterRefreshEvent) => void): void;
    }
}
declare module api.app.remove {
    class DeleteItem {
        private iconUrl;
        private displayName;
        constructor(iconUrl: string, displayName: string);
        getDisplayName(): string;
        getIconUrl(): string;
    }
}
declare module api.app.remove {
    class CancelDeleteDialogAction extends api.ui.Action {
        constructor();
    }
}
declare module api.app.view {
    import ContentSummaryAndCompareStatus = api.content.ContentSummaryAndCompareStatus;
    class ViewItem<M extends api.Equitable> implements api.Equitable {
        private model;
        private displayName;
        private iconClass;
        private path;
        private pathName;
        private iconUrl;
        private iconSize;
        private renderable;
        constructor(model: M);
        static fromContentSummaryAndCompareStatus(model: ContentSummaryAndCompareStatus): ViewItem<ContentSummaryAndCompareStatus>;
        setDisplayName(value: string): ViewItem<M>;
        setPath(value: string): ViewItem<M>;
        setPathName(value: string): ViewItem<M>;
        setIconUrl(value: string): ViewItem<M>;
        setIconClass(iconClass: string): ViewItem<M>;
        setIconSize(value: number): ViewItem<M>;
        setRenderable(value: boolean): ViewItem<M>;
        getModel(): M;
        getDisplayName(): string;
        getPath(): string;
        getPathName(): string;
        getIconUrl(): string;
        getIconClass(): string;
        getIconSize(): number;
        isRenderable(): boolean;
        equals(o: api.Equitable): boolean;
    }
}
declare module api.app.view {
    class ItemStatisticsPanel<M extends api.Equitable> extends api.ui.panel.Panel {
        private browseItem;
        private header;
        constructor(className?: string);
        getHeader(): ItemStatisticsHeader<M>;
        setItem(item: api.app.view.ViewItem<M>): void;
        getItem(): ViewItem<M>;
    }
}
declare module api.app.view {
    class MultiItemStatisticsPanel<M extends api.Equitable> extends ItemStatisticsPanel<M> {
        private tabMenu;
        private deckPanel;
        constructor(className?: string);
        getTabMenu(): api.ui.tab.TabMenu;
        getDeckPanel(): api.ui.panel.NavigatedDeckPanel;
        addNavigablePanel(tab: api.ui.tab.TabMenuItem, panel: api.ui.panel.Panel, select?: boolean): void;
        showPanel(index: number): void;
    }
}
declare module api.app.view {
    class ItemStatisticsHeader<M extends api.Equitable> extends api.dom.DivEl {
        private browseItem;
        private iconEl;
        private headerTitleEl;
        private headerPathEl;
        constructor();
        setItem(item: ViewItem<M>): void;
        setIconUrl(value: string): void;
        setHeaderSubtitle(value: string, className: string): void;
        private createIconEl(item);
        private appendToHeaderPath(value, className);
    }
}
declare module api.app.view {
    class ItemViewPanel<M extends api.Equitable> extends api.ui.panel.Panel implements api.ui.Closeable {
        private toolbar;
        private panel;
        private browseItem;
        private closedListeners;
        constructor();
        setToolbar(toolbar: api.ui.toolbar.Toolbar): void;
        setPanel(panel: api.ui.panel.Panel): void;
        getActions(): api.ui.Action[];
        setItem(item: ViewItem<M>): void;
        getItem(): ViewItem<M>;
        close(checkCanClose?: boolean): void;
        canClose(): boolean;
        onClosed(listener: (event: ItemViewClosedEvent<M>) => void): void;
        unClosed(listener: (event: ItemViewClosedEvent<M>) => void): void;
        private notifyClosed();
    }
}
declare module api.app.view {
    class ItemViewClosedEvent<M extends api.Equitable> {
        private view;
        constructor(view: ItemViewPanel<M>);
        getView(): ItemViewPanel<M>;
    }
}
declare module api.app.view {
    class ItemPreviewPanel extends api.ui.panel.Panel {
        protected frame: api.dom.IFrameEl;
        protected mask: api.ui.mask.LoadMask;
        constructor(className?: string);
    }
}
declare module api.app.view {
    class ItemDataGroup extends api.dom.DivEl {
        private header;
        private empty;
        constructor(title: string, className?: string);
        addDataList(header: string, ...datas: string[]): void;
        addDataArray(header: string, datas: string[]): void;
        addDataElements(header: string, datas: api.dom.Element[]): void;
        private addHeader(header, dataList);
        isEmpty(): boolean;
    }
}
declare module api.app.wizard {
    interface DisplayNameGenerator {
        hasScript(): boolean;
        execute(): string;
    }
}
declare module api.app.wizard {
    class SaveAction extends api.ui.Action {
        constructor(wizardPanel: WizardPanel<any>, label?: string);
    }
}
declare module api.app.wizard {
    class CloseAction extends api.ui.Action {
        constructor(wizardPanel: api.app.wizard.WizardPanel<any>, checkCanClose?: boolean);
    }
}
declare module api.app.wizard {
    class SaveAndCloseAction extends api.ui.Action {
        constructor(wizardPanel: WizardPanel<any>);
    }
}
declare module api.app.wizard {
    class WizardActions<T> {
        private actions;
        private suspendedActions;
        constructor(...actions: api.ui.Action[]);
        setActions(...actions: api.ui.Action[]): void;
        enableActionsForNew(): void;
        enableActionsForExisting(existing: T): void;
        getActions(): api.ui.Action[];
        suspendActions(suspend?: boolean): void;
    }
}
declare module api.app.wizard {
    class FormIcon extends api.dom.ButtonEl {
        private img;
        constructor(iconUrl: string, className?: string);
        setSrc(src: string): void;
    }
}
declare module api.app.wizard {
    class WizardHeader extends api.dom.DivEl {
        private propertyChangedListeners;
        constructor();
        onPropertyChanged(listener: (event: api.PropertyChangedEvent) => void): void;
        unPropertyChanged(listener: (event: api.PropertyChangedEvent) => void): void;
        notifyPropertyChanged(property: string, oldValue: string, newValue: string): void;
        isValid(): boolean;
        giveFocus(): boolean;
    }
}
declare module api.app.wizard {
    class WizardHeaderWithDisplayNameAndNameBuilder {
        displayNameGenerator: DisplayNameGenerator;
        setDisplayNameGenerator(value: DisplayNameGenerator): WizardHeaderWithDisplayNameAndNameBuilder;
        build(): WizardHeaderWithDisplayNameAndName;
    }
    class WizardHeaderWithDisplayNameAndName extends WizardHeader {
        private displayNameGenerator;
        private forbiddenChars;
        private displayNameEl;
        private displayNameProgrammaticallySet;
        private pathEl;
        private nameEl;
        private autoGenerateName;
        private autoGenerationEnabled;
        private ignoreGenerateStatusForName;
        private simplifiedNameGeneration;
        constructor(builder: WizardHeaderWithDisplayNameAndNameBuilder);
        private checkAutoGenerateName(name, displayName);
        resetBaseValues(): void;
        initNames(displayName: string, name: string, forceDisplayNameProgrammaticallySet: boolean, ignoreDirtyFlag?: boolean): void;
        private doAutoGenerateName(value);
        isAutoGenerationEnabled(): boolean;
        setAutoGenerationEnabled(value: boolean): void;
        setDisplayName(value: string): void;
        setPath(value: string): void;
        setSimplifiedNameGeneration(value: boolean): void;
        disableNameInput(): void;
        getName(): string;
        getDisplayName(): string;
        giveFocus(): boolean;
        private generateName(value);
        private ensureValidName(possibleInvalidName);
        private setIgnoreGenerateStatusForName(value);
        disableNameGeneration(value: boolean): void;
        private updateNameGeneratedStatus();
        private updatePathAndNameWidth();
        isValid(): boolean;
    }
}
declare module api.app.wizard {
    class WizardHeaderWithName extends WizardHeader {
        private nameEl;
        constructor();
        getName(): string;
        setName(value: string): void;
        giveFocus(): boolean;
    }
}
declare module api.app.wizard {
    class WizardStepsPanel extends api.ui.panel.NavigatedPanelStrip {
        constructor(navigator: WizardStepNavigator, scrollable?: api.dom.Element);
    }
}
declare module api.app.wizard {
    import TabBarItem = api.ui.tab.TabBarItem;
    class WizardStepNavigator extends api.ui.tab.TabBar {
        constructor();
        insertNavigationItem(tab: TabBarItem, index: number, silent?: boolean): void;
        addNavigationItem(step: api.ui.tab.TabBarItem): void;
        nextStep(): void;
        previousStep(): void;
        hasNext(): boolean;
        hasPrevious(): boolean;
        private addKeyNavigation(tab);
    }
}
declare module api.app.wizard {
    class WizardStep {
        private tabBarItem;
        private stepForm;
        constructor(label: string, stepForm: WizardStepForm);
        getTabBarItem(): api.ui.tab.TabBarItem;
        getStepForm(): WizardStepForm;
        toggleHelpText(show?: boolean): void;
        hasHelpText(): boolean;
        show(show: boolean): void;
    }
}
declare module api.app.wizard {
    class WizardStepValidityChangedEvent {
        private valid;
        constructor(isValid: boolean);
        isValid(): boolean;
    }
}
declare module api.app.wizard {
    import ValidationRecording = api.form.ValidationRecording;
    class WizardStepForm extends api.ui.panel.Panel {
        private validityChangedListeners;
        previousValidation: ValidationRecording;
        private focusListeners;
        private blurListeners;
        constructor(className?: string);
        validate(silent?: boolean): ValidationRecording;
        isValid(): boolean;
        onValidityChanged(listener: (event: WizardStepValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: WizardStepValidityChangedEvent) => void): void;
        notifyValidityChanged(event: WizardStepValidityChangedEvent): void;
        onFocus(listener: (event: FocusEvent) => void): void;
        unFocus(listener: (event: FocusEvent) => void): void;
        onBlur(listener: (event: FocusEvent) => void): void;
        unBlur(listener: (event: FocusEvent) => void): void;
        notifyFocused(event: FocusEvent): void;
        notifyBlurred(event: FocusEvent): void;
        toggleHelpText(show?: boolean): void;
        hasHelpText(): boolean;
    }
}
declare module api.app.wizard {
    import Toolbar = api.ui.toolbar.Toolbar;
    import Panel = api.ui.panel.Panel;
    import Equitable = api.Equitable;
    import ActionContainer = api.ui.ActionContainer;
    import Closeable = api.ui.Closeable;
    interface WizardPanelParams<EQUITABLE extends Equitable> {
        tabId: api.app.bar.AppBarTabId;
        persistedItem?: EQUITABLE;
    }
    class WizardPanel<EQUITABLE extends Equitable> extends Panel implements Closeable, ActionContainer {
        protected params: WizardPanelParams<EQUITABLE>;
        protected wizardActions: WizardActions<EQUITABLE>;
        private persistedItem;
        private stepNavigator;
        private steps;
        private stepsPanel;
        protected wizardHeader: WizardHeader;
        protected livePanel: Panel;
        protected mainToolbar: Toolbar;
        protected stepToolbar: Toolbar;
        protected formIcon: api.dom.Element;
        protected formMask: api.ui.mask.LoadMask;
        protected liveMask: api.ui.mask.LoadMask;
        private isChanged;
        private dataLoaded;
        protected formState: FormState;
        private closedListeners;
        private dataLoadedListeners;
        protected formPanel: Panel;
        private lastFocusedElement;
        private stepNavigatorAndToolbarContainer;
        private splitPanel;
        private splitPanelThreshold;
        private stepNavigatorPlaceholder;
        private validityManager;
        private minimizeEditButton;
        private minimized;
        private toggleMinimizeListener;
        private helpTextToggleButton;
        private helpTextShown;
        private scrollPosition;
        private wizardHeaderCreatedListeners;
        static debug: boolean;
        constructor(params: WizardPanelParams<EQUITABLE>);
        protected setParams(params: WizardPanelParams<EQUITABLE>): void;
        protected getParams(): WizardPanelParams<EQUITABLE>;
        protected createWizardActions(): WizardActions<EQUITABLE>;
        protected loadData(): void;
        protected doLoadData(): wemQ.Promise<EQUITABLE>;
        protected isDataLoaded(): boolean;
        doRender(): wemQ.Promise<boolean>;
        protected createMainToolbar(): Toolbar;
        getMainToolbar(): Toolbar;
        protected createLivePanel(): Panel;
        getLivePanel(): Panel;
        protected createWizardHeader(): WizardHeader;
        getWizardHeader(): WizardHeader;
        protected createFormIcon(): api.dom.Element;
        getFormIcon(): api.dom.Element;
        protected createStepToolbar(): Toolbar;
        getStepToolbar(): Toolbar;
        protected doRenderOnDataLoaded(rendered: boolean, delayMask?: boolean): wemQ.Promise<boolean>;
        onDataLoaded(listener: (item: EQUITABLE) => void): void;
        unDataLoaded(listener: (item: EQUITABLE) => void): void;
        private notifyDataLoaded(item);
        protected getWizardStepsPanel(): WizardStepsPanel;
        updateStickyToolbar(): void;
        updateToolbarActions(): void;
        toggleMinimize(navigationIndex?: number): void;
        private toggleHelpTextShown();
        hasHelpText(): boolean;
        private setupHelpTextToggleButton();
        isMinimized(): boolean;
        giveInitialFocus(): void;
        startRememberFocus(): void;
        resetLastFocusedElement(): void;
        getTabId(): api.app.bar.AppBarTabId;
        setTabId(tabId: api.app.bar.AppBarTabId): void;
        getIconUrl(): string;
        getActions(): api.ui.Action[];
        getSteps(): WizardStep[];
        setSteps(steps: WizardStep[]): void;
        addStep(step: WizardStep, select: boolean): void;
        insertStepBefore(stepToInsert: WizardStep, beforeStep: WizardStep): void;
        removeStepWithForm(form: WizardStepForm): number;
        doLayout(persistedItem: EQUITABLE): wemQ.Promise<void>;
        getPersistedItem(): EQUITABLE;
        isItemPersisted(): boolean;
        protected setPersistedItem(newPersistedItem: EQUITABLE): void;
        hasUnsavedChanges(): boolean;
        saveChanges(): wemQ.Promise<EQUITABLE>;
        persistNewItem(): wemQ.Promise<EQUITABLE>;
        postPersistNewItem(persistedItem: EQUITABLE): wemQ.Promise<EQUITABLE>;
        updatePersistedItem(): wemQ.Promise<EQUITABLE>;
        postUpdatePersistedItem(persistedItem: EQUITABLE): wemQ.Promise<EQUITABLE>;
        close(checkCanClose?: boolean): void;
        canClose(): boolean;
        onClosed(listener: (event: WizardClosedEvent) => void): void;
        unClosed(listener: (event: WizardClosedEvent) => void): void;
        getSplitPanel(): api.ui.panel.SplitPanel;
        showMinimizeEditButton(): void;
        hideMinimizeEditButton(): void;
        private createSplitPanel(firstPanel, secondPanel);
        private notifyClosed(checkCanClose);
        onValidityChanged(listener: (event: ValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: ValidityChangedEvent) => void): void;
        notifyValidityChanged(valid: boolean): void;
        onWizardHeaderCreated(listener: () => void): void;
        unWizardHeaderCreated(listener: () => void): void;
        notifyWizardHeaderCreated(): void;
        isValid(): boolean;
    }
    class FormState {
        private formIsNew;
        constructor(isNew: boolean);
        setIsNew(value: boolean): void;
        isNew(): boolean;
    }
}
declare module api.app.wizard {
    class MinimizeWizardPanelEvent extends api.event.Event {
        static on(handler: (event: MinimizeWizardPanelEvent) => void): void;
        static un(handler?: (event: MinimizeWizardPanelEvent) => void): void;
    }
}
declare module api.app.wizard {
    class UploadFinishedEvent {
        private uploadItem;
        constructor(uploadItem: api.ui.uploader.UploadItem<any>);
        getUploadItem(): api.ui.uploader.UploadItem<any>;
    }
}
declare module api.app.wizard {
    class WizardClosedEvent {
        private wizard;
        private checkCanClose;
        constructor(wizard: WizardPanel<any>, checkCanClose: boolean);
        getWizard(): WizardPanel<any>;
        isCheckCanClose(): boolean;
    }
}
declare module api.app.wizard {
    class WizardValidityManager {
        private steps;
        private header;
        private validityChangedListeners;
        constructor();
        clearItems(): void;
        getSteps(): WizardStep[];
        addItem(step: WizardStep): void;
        removeItem(step: WizardStep): void;
        setHeader(header: WizardHeader): void;
        isAllValid(): boolean;
        onValidityChanged(listener: (event: ValidityChangedEvent) => void): void;
        unValidityChanged(listener: (event: ValidityChangedEvent) => void): void;
        notifyValidityChanged(valid: boolean): void;
    }
}
declare module api.app.wizard {
    import ContentId = api.content.ContentId;
    class MaskContentWizardPanelEvent extends api.event.Event {
        private contentId;
        private mask;
        constructor(contentId: ContentId, mask?: boolean);
        isMask(): boolean;
        getContentId(): ContentId;
        static on(handler: (event: MaskContentWizardPanelEvent) => void): void;
        static un(handler?: (event: MaskContentWizardPanelEvent) => void): void;
    }
}
declare module api.app.wizard {
    import Toolbar = api.ui.toolbar.Toolbar;
    class WizardStepNavigatorAndToolbar extends api.dom.DivEl {
        static maxFittingWidth: number;
        private foldButton;
        private stepToolbar;
        private stepNavigator;
        private fittingWidth;
        private helpTextToggleButton;
        constructor(className?: string);
        setupHelpTextToggleButton(): api.dom.DivEl;
        setStepToolbar(stepToolbar: Toolbar): void;
        setStepNavigator(stepNavigator: WizardStepNavigator): void;
        private onStepChanged(index);
        private isStepNavigatorFit();
        private updateStepLabels(numberTabs);
        checkAndMinimize(): void;
    }
}
declare module api.system {
    interface StatusJson {
        installation: string;
        version: string;
        context?: {
            authenticated: boolean;
            principals: string[];
        };
    }
}
declare module api.system {
    class StatusRequest extends api.rest.ResourceRequest<StatusJson, StatusResult> {
        getRequestPath(): api.rest.Path;
        getParams(): Object;
        sendAndParse(): wemQ.Promise<StatusResult>;
    }
}
declare module api.system {
    class StatusResult {
        private installation;
        private version;
        private authenticated;
        private principals;
        constructor(json: StatusJson);
        isAuthenticated(): boolean;
        getInstallation(): string;
        getVersion(): string;
        getPrincipals(): api.security.PrincipalKey[];
    }
}
declare module api.system {
    class LostConnectionDetector {
        private intervalId;
        private pollIntervalMs;
        private connected;
        private authenticated;
        private connectionLostListeners;
        private connectionRestoredListeners;
        private sessionExpiredListeners;
        constructor(pollIntervalMs?: number);
        startPolling(): void;
        stopPolling(): void;
        setAuthenticated(isAuthenticated: boolean): void;
        private doPoll();
        isConnected(): boolean;
        isAuthenticated(): boolean;
        onConnectionLost(listener: () => void): void;
        onConnectionRestored(listener: () => void): void;
        onSessionExpired(listener: () => void): void;
        unConnectionLost(listener: () => void): void;
        unConnectionRestored(listener: () => void): void;
        unSessionExpired(listener: () => void): void;
        private notifyConnectionLost();
        private notifyConnectionRestored();
        private notifySessionExpired();
    }
}
declare module api.liveedit {
    import Content = api.content.Content;
    import PageModel = api.content.page.PageModel;
    import PageTemplate = api.content.page.PageTemplate;
    import PageDescriptor = api.content.page.PageDescriptor;
    import SiteModel = api.content.site.SiteModel;
    import ContentFormContext = api.content.form.ContentFormContext;
    class LiveEditModel {
        private siteModel;
        private parentContent;
        private content;
        private formContext;
        private pageModel;
        constructor(builder: LiveEditModelBuilder);
        init(defaultTemplate: PageTemplate, defaultTemplateDescriptor: PageDescriptor): wemQ.Promise<void>;
        isPageRenderable(): boolean;
        setContent(value: Content): void;
        getParentContent(): Content;
        getFormContext(): ContentFormContext;
        getContent(): Content;
        getSiteModel(): SiteModel;
        getPageModel(): PageModel;
        isRenderableContent(): boolean;
        isFragmentAllowed(): boolean;
        static create(): LiveEditModelBuilder;
    }
    class LiveEditModelBuilder {
        siteModel: SiteModel;
        parentContent: Content;
        content: Content;
        formContext: ContentFormContext;
        setSiteModel(value: SiteModel): LiveEditModelBuilder;
        setParentContent(value: Content): LiveEditModelBuilder;
        setContent(value: Content): LiveEditModelBuilder;
        setContentFormContext(value: ContentFormContext): LiveEditModelBuilder;
        build(): LiveEditModel;
    }
    class LiveEditModelInitializer {
        static initPageModel(liveEditModel: LiveEditModel, content: Content, defaultPageTemplate: PageTemplate, defaultTemplateDescriptor: PageDescriptor): Q.Promise<PageModel>;
        private static initPageTemplate(content, pageMode, pageModel, promises);
        private static initPage(content, pageMode, pageModel, promises);
        private static initForcedControllerPageTemplate(pageTemplate, pageModel, promises);
        private static initNoControllerPageTemplate(pageTemplate, pageModel);
        private static initForcedTemplatePage(content, page, pageModel, promises);
        private static initForcedControllerPage(page, pageModel, promises);
        private static initNoControllerPage(pageModel);
        private static initPageController(page, pageModel, pageDescriptor);
        private static getPageMode(content, defaultTemplatePresents);
        private static loadPageTemplate(key);
        private static loadPageDescriptor(key);
        private static resolvePromises(pageModel, promises);
    }
}
declare module api.liveedit {
    class ItemType implements api.Equitable {
        static ATTRIBUTE_TYPE: string;
        static ATTRIBUTE_REGION_NAME: string;
        private static shortNameToInstance;
        private shortName;
        private config;
        constructor(shortName: string);
        protected getItemTypeConfig(itemType: string): ItemTypeConfig;
        getShortName(): string;
        getConfig(): ItemTypeConfig;
        isComponentType(): boolean;
        toComponentType(): api.content.page.region.ComponentType;
        createView(config: CreateItemViewConfig<ItemView, any>): ItemView;
        equals(o: api.Equitable): boolean;
        static getDraggables(): ItemType[];
        static byShortName(shortName: string): ItemType;
        static fromHTMLElement(element: HTMLElement): ItemType;
        static fromElement(element: api.dom.Element): ItemType;
    }
}
declare module api.liveedit {
    class CreateItemViewConfig<PARENT extends ItemView, DATA> {
        itemViewProducer: ItemViewIdProducer;
        parentView: PARENT;
        parentElement: api.dom.Element;
        data: DATA;
        element: api.dom.Element;
        positionIndex: number;
        /**
         * Optional. The ItemViewIdProducer of parentRegionView will be used if not set.
         */
        setItemViewProducer(value: ItemViewIdProducer): CreateItemViewConfig<PARENT, DATA>;
        setParentView(value: PARENT): CreateItemViewConfig<PARENT, DATA>;
        setParentElement(value: api.dom.Element): CreateItemViewConfig<PARENT, DATA>;
        setData(value: DATA): CreateItemViewConfig<PARENT, DATA>;
        setElement(value: api.dom.Element): CreateItemViewConfig<PARENT, DATA>;
        /**
         * Optional. If not set then ItemView should be added as last child.
         */
        setPositionIndex(value: number): CreateItemViewConfig<PARENT, DATA>;
    }
}
declare module api.liveedit {
    interface HighlighterStyle {
        stroke: string;
        strokeDasharray: string;
        fill: string;
    }
    interface ItemTypeConfigJson {
        typeName?: string;
        cssSelector: string;
        draggable: boolean;
        cursor: string;
        iconCls: string;
        highlighterStyle?: HighlighterStyle;
        contextMenuConfig: string[];
    }
    class ItemTypeConfig {
        private typeName;
        private draggable;
        private cssSelector;
        private iconCls;
        private cursor;
        private highlighterStyle;
        private contextMenuConfig;
        constructor(json: ItemTypeConfigJson);
        getName(): string;
        isDraggable(): boolean;
        getCssSelector(): string;
        getIconCls(): string;
        getCursor(): string;
        getHighlighterStyle(): HighlighterStyle;
        getContextMenuConfig(): string[];
    }
}
declare module api.liveedit {
    import Region = api.content.page.region.Region;
    class RegionItemType extends ItemType {
        private static INSTANCE;
        static get(): RegionItemType;
        constructor();
        static getRegionName(element: api.dom.Element): string;
        protected getItemTypeConfig(itemType: string): ItemTypeConfig;
        createView(config: CreateItemViewConfig<ItemView, Region>): RegionView;
    }
}
declare module api.liveedit {
    class InitializeLiveEditEvent extends api.event.Event {
        private liveEditModel;
        constructor(liveEditModel: LiveEditModel);
        getLiveEditModel(): LiveEditModel;
        static on(handler: (event: InitializeLiveEditEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: InitializeLiveEditEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    class SkipLiveEditReloadConfirmationEvent extends api.event.Event {
        private skip;
        constructor(skip: boolean);
        isSkip(): boolean;
        static on(handler: (event: SkipLiveEditReloadConfirmationEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: SkipLiveEditReloadConfirmationEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Component = api.content.page.region.Component;
    class ComponentItemType extends ItemType {
        createView(config: CreateItemViewConfig<RegionView, Component>): ComponentView<Component>;
        protected getItemTypeConfig(itemType: string): ItemTypeConfig;
    }
}
declare module api.liveedit {
    class PageItemType extends ItemType {
        private static INSTANCE;
        static get(): PageItemType;
        constructor();
        protected getItemTypeConfig(itemType: string): ItemTypeConfig;
        createView(config: CreateItemViewConfig<any, any>): PageView;
    }
}
declare module api.liveedit {
    import PartComponentView = api.liveedit.part.PartComponentView;
    class ContentItemType extends ItemType {
        private static INSTANCE;
        static get(): ContentItemType;
        constructor();
        protected getItemTypeConfig(itemType: string): ItemTypeConfig;
        createView(config: CreateItemViewConfig<PartComponentView, any>): ContentView;
    }
}
declare module api.liveedit {
    import Element = api.dom.Element;
    class Shader {
        private static CLS_NAME;
        private target;
        private scrollEnabled;
        private pageShader;
        private northShader;
        private eastShader;
        private southShader;
        private westShader;
        private shaders;
        private clickListeners;
        private unlockClickedListeners;
        private mouseEnterListeners;
        private mouseLeaveListeners;
        private mouseMoveListeners;
        private static INSTANCE;
        private static debug;
        constructor();
        private createShaderDiv(cls);
        static get(): Shader;
        setScrollEnabled(enabled: boolean): Shader;
        shade(element: Element): void;
        hide(): void;
        isVisible(): boolean;
        onUnlockClicked(listener: (event: MouseEvent) => void): void;
        unUnlockClicked(listener: (event: MouseEvent) => void): void;
        private notifyUnlockClicked(event);
        onMouseEnter(listener: (event: MouseEvent) => void): void;
        unMouseEnter(listener: (event: MouseEvent) => void): void;
        private notifyMouseEntered(event);
        onMouseLeave(listener: (event: MouseEvent) => void): void;
        unMouseLeave(listener: (event: MouseEvent) => void): void;
        private notifyMouseLeft(event);
        onMouseMove(listener: (event: MouseEvent) => void): void;
        unMouseMove(listener: (event: MouseEvent) => void): void;
        private notifyMouseMove(event);
        onClicked(listener: (event: MouseEvent) => void): void;
        unClicked(listener: (event: MouseEvent) => void): void;
        private notifyClicked(event);
        private handleUnlockClick(event);
        private handleClick(event);
        private showShaderIfNecessary(shader, x, y, width, height);
        private resizeToPage();
        private resizeToElement(element);
    }
}
declare module api.liveedit {
    enum HighlighterMode {
        RECTANGLE = 0,
        CROSSHAIR = 1,
    }
    class Highlighter extends api.dom.Element {
        private rectangle;
        private path;
        private static INSTANCE;
        private lastHighlightedItemView;
        private mode;
        constructor(type?: HighlighterMode);
        static get(): Highlighter;
        highlightItemView(itemView: ItemView): void;
        highlightElement(dimensions: ElementDimensions, style: HighlighterStyle): void;
        updateLastHighlightedItemView(): void;
        setMode(mode: HighlighterMode): Highlighter;
        isViewInsideSelectedContainer(itemView: ItemView): boolean;
        getSelectedView(): ItemView;
        unselect(): void;
        protected preProcessStyle(style: HighlighterStyle, isEmptyView: boolean): HighlighterStyle;
        private resize(dimensions, style);
        private generatePath(x, y, w, h, screenW, screenH, left);
    }
}
declare module api.liveedit {
    class SelectedHighlighter extends Highlighter {
        private static SELECT_INSTANCE;
        constructor();
        static get(): SelectedHighlighter;
        protected preProcessStyle(style: api.liveedit.HighlighterStyle, isEmptyView: boolean): api.liveedit.HighlighterStyle;
    }
}
declare module api.liveedit {
    class Cursor {
        defaultBodyCursor: string;
        private static INSTANCE;
        constructor();
        static get(): Cursor;
        displayItemViewCursor(itemView: ItemView): void;
        hide(): void;
        reset(): void;
    }
}
declare module api.liveedit {
    class ItemViewId implements api.Equitable {
        static DATA_ATTRIBUTE: string;
        private value;
        private refString;
        constructor(value: number);
        equals(o: api.Equitable): boolean;
        toNumber(): number;
        toString(): string;
        static fromString(s: string): ItemViewId;
    }
}
declare module api.liveedit {
    class ItemViewIdProducer {
        private itemViewCounter;
        next(): ItemViewId;
    }
}
declare module api.liveedit {
    class RepeatNextItemViewIdProducer extends ItemViewIdProducer {
        private idToRepeatNext;
        private itemViewProducer;
        private repeated;
        constructor(idToRepeatNext: ItemViewId, itemViewProducer: ItemViewIdProducer);
        next(): ItemViewId;
    }
}
declare module api.liveedit {
    import Component = api.content.page.region.Component;
    interface ElementDimensions {
        top: number;
        left: number;
        width: number;
        height: number;
    }
    class ItemViewBuilder {
        liveEditModel: LiveEditModel;
        itemViewIdProducer: ItemViewIdProducer;
        type: ItemType;
        element: api.dom.Element;
        parentElement: api.dom.Element;
        parentView: ItemView;
        contextMenuActions: api.ui.Action[];
        contextMenuTitle: ItemViewContextMenuTitle;
        placeholder: ItemViewPlaceholder;
        viewer: api.ui.Viewer<any>;
        setLiveEditModel(value: LiveEditModel): ItemViewBuilder;
        setItemViewIdProducer(value: ItemViewIdProducer): ItemViewBuilder;
        setType(value: ItemType): ItemViewBuilder;
        setElement(value: api.dom.Element): ItemViewBuilder;
        setPlaceholder(value: ItemViewPlaceholder): ItemViewBuilder;
        setViewer(value: api.ui.Viewer<any>): ItemViewBuilder;
        setParentView(value: ItemView): ItemViewBuilder;
        setParentElement(value: api.dom.Element): ItemViewBuilder;
        setContextMenuActions(actions: api.ui.Action[]): ItemViewBuilder;
        setContextMenuTitle(title: ItemViewContextMenuTitle): ItemViewBuilder;
    }
    class ItemView extends api.dom.Element {
        protected liveEditModel: LiveEditModel;
        private itemViewIdProducer;
        private placeholder;
        private type;
        private parentItemView;
        private loadMask;
        private contextMenu;
        private contextMenuTitle;
        private contextMenuActions;
        private viewer;
        private mouseOver;
        private shaded;
        private mouseOverViewListeners;
        private mouseOutViewListeners;
        private mouseOverViewListener;
        private mouseLeaveViewListener;
        private shaderClickedListener;
        private mouseEnterListener;
        private mouseLeaveListener;
        private mouseClickedListener;
        private contextMenuListener;
        static debug: boolean;
        constructor(builder: ItemViewBuilder);
        protected addContextMenuActions(actions: api.ui.Action[]): void;
        protected removeContextMenuAction(action: api.ui.Action): void;
        protected setPlaceholder(placeholder: ItemViewPlaceholder): void;
        protected disableLinks(): void;
        setContextMenuTitle(title: ItemViewContextMenuTitle): void;
        private bindMouseListeners();
        protected unbindMouseListeners(): void;
        highlight(): void;
        unhighlight(): void;
        highlightSelected(): void;
        unhighlightSelected(): void;
        shade(): void;
        unshade(): void;
        showCursor(): void;
        resetCursor(): void;
        getPageView(): PageView;
        remove(): ItemView;
        setDraggable(value: boolean): void;
        scrollComponentIntoView(): void;
        /**
         * Process 'mouseenter' event to track when mouse moves between ItemView's.
         * ItemView notifies that mouse is over it if mouse moves from parent or child ItemView to this one.
         *
         * Method manages two cases:
         * 1. 'mouseenter' was triggered on parent ItemView and then it is triggered on its child ItemView.
         *    - parent has 'mouseOver' state set to 'true';
         *    - the ItemView calls parent.notifyMouseOut(), parent is still in 'mouseOver' state;
         *    - the ItemView receive 'mouseOver' state;
         *    - the ItemView notifies about mouseOver event;
         * 2. 'mouseenter' was triggered on child ItemView before it has been triggered on parent ItemView.
         *    (This occurs when child ItemView is adjacent to its parent's edge.)
         *    - direct parent hasn't received 'mouseOver' state yet;
         *    - look up for the first parent ItemView with 'mouseOver' state, it is ItemView the mouse came from;
         *    - the parent with 'mouseOver' state calls notifyMouseOut();
         *    - go to the previous parent, give it 'mouseOver' state, call notifyMouseOver() and notifyMouseOut() events,
         *      repeat until current ItemView reached;
         *    - set 'mouseOver' state to this ItemView;
         *    - notify about mouseOver event for this ItemView;
         *
         * @param event browser MouseEvent
         */
        handleMouseEnter(event: MouseEvent): void;
        private manageParentsMouseOver();
        /**
         * Process 'mouseleave' event to track when mouse moves between ItemView's.
         * ItemView notifies that mouse left it when mouse moves to its parent or child ItemView.
         *
         * 'mouseleave' event is always triggered on child element before it has been triggered on parent.
         *
         * @param event browser MouseEvent
         */
        handleMouseLeave(event: MouseEvent): void;
        isEmpty(): boolean;
        refreshEmptyState(): ItemView;
        handleClick(event: MouseEvent): void;
        handleShaderClick(event: MouseEvent): void;
        protected isEventOverItem(event: MouseEvent): boolean;
        getItemViewIdProducer(): ItemViewIdProducer;
        showContextMenu(clickPosition?: Position, menuPosition?: ItemViewContextMenuPosition): void;
        hideContextMenu(): void;
        private invalidateContextMenu();
        private setItemId(value);
        getItemId(): ItemViewId;
        static parseItemId(element: HTMLElement): ItemViewId;
        getType(): ItemType;
        getParentItemView(): ItemView;
        setParentItemView(itemView: ItemView): void;
        isSelected(): boolean;
        select(clickPosition?: Position, menuPosition?: ItemViewContextMenuPosition, isNew?: boolean, rightClicked?: boolean): void;
        selectWithoutMenu(isNew?: boolean): void;
        private selectItem();
        deselect(silent?: boolean): void;
        isDraggableView(): boolean;
        private stopTextEditMode();
        private selectPlaceholder();
        private deselectPlaceholder();
        showRenderingError(url: string, errorMessage?: string): void;
        getName(): string;
        getIconUrl(content: api.content.Content): string;
        getIconClass(): string;
        showLoadingSpinner(): void;
        hideLoadingSpinner(): void;
        getContextMenuActions(): api.ui.Action[];
        toItemViewArray(): ItemView[];
        toString(): string;
        getLiveEditModel(): LiveEditModel;
        getViewer(): api.ui.Viewer<any>;
        static findParentItemViewAsHTMLElement(htmlElement: HTMLElement): HTMLElement;
        onMouseOverView(listener: () => void): void;
        unMouseOverView(listener: () => void): void;
        private notifyMouseOverView();
        onMouseLeaveView(listener: () => void): void;
        unMouseLeaveView(listener: () => void): void;
        private notifyMouseLeaveView();
        protected getContextMenuTitle(): ItemViewContextMenuTitle;
        private calcDistanceToViewport();
        private getDocumentScrollTop();
        protected addComponentView(componentView: ComponentView<Component>, index?: number, isNew?: boolean): void;
        protected getNewItemIndex(): number;
        protected createComponentView(componentItemType: ItemType): ItemView;
        private getInsertActions(liveEditModel);
        protected getRegionView(): RegionView;
        protected createInsertAction(): api.ui.Action;
        protected createSelectParentAction(): api.ui.Action;
        private createInsertSubAction(label, componentItemType);
        isChildOfItemView(itemView: ItemView): boolean;
        isContainer(): boolean;
        private isViewInsideSelectedContainer();
    }
}
declare module api.liveedit {
    class ItemViewAddedEvent {
        private view;
        private newlyCreated;
        constructor(view: ItemView, isNew?: boolean);
        getView(): ItemView;
        isNew(): boolean;
    }
}
declare module api.liveedit {
    class ItemViewRemovedEvent {
        private view;
        constructor(view: ItemView);
        getView(): ItemView;
    }
}
declare module api.liveedit {
    class ItemViewSelectedEvent extends api.event.Event {
        private pageItemView;
        private position;
        private newlyCreated;
        private rightClicked;
        constructor(itemView: ItemView, position: Position, isNew?: boolean, rightClicked?: boolean);
        getItemView(): ItemView;
        getPosition(): Position;
        isNew(): boolean;
        isRightClicked(): boolean;
        static on(handler: (event: ItemViewSelectedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: ItemViewSelectedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    class ItemViewDeselectedEvent extends api.event.Event {
        private itemView;
        constructor(itemView: ItemView);
        getItemView(): ItemView;
        static on(handler: (event: ItemViewDeselectedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: ItemViewDeselectedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    class ItemViewContextMenuTitle extends api.app.NamesAndIconView {
        constructor(name: string, icon: string);
    }
}
declare module api.liveedit {
    import Component = api.content.page.region.Component;
    class ComponentViewContextMenuTitle<COMPONENT extends Component> extends ItemViewContextMenuTitle {
        constructor(component: COMPONENT, type: ComponentItemType);
    }
}
declare module api.liveedit {
    class ContentViewContextMenuTitle extends ItemViewContextMenuTitle {
        constructor(contentView: ContentView);
    }
}
declare module api.liveedit {
    class PageViewContextMenuTitle extends ItemViewContextMenuTitle {
        constructor(content: api.content.Content);
    }
}
declare module api.liveedit {
    class RegionViewContextMenuTitle extends ItemViewContextMenuTitle {
        constructor(region: api.content.page.region.Region);
    }
}
declare module api.liveedit {
    import Action = api.ui.Action;
    enum ItemViewContextMenuOrientation {
        UP = 0,
        DOWN = 1,
    }
    class ItemViewContextMenu extends api.dom.DivEl {
        private title;
        private menu;
        private arrow;
        private orientation;
        private orientationListeners;
        constructor(menuTitle: ItemViewContextMenuTitle, actions: Action[], showArrow?: boolean, listenToWizard?: boolean);
        showAt(x: number, y: number, notClicked?: boolean): void;
        moveBy(dx: number, dy: number): void;
        setActions(actions: api.ui.Action[]): void;
        getMenu(): api.ui.menu.TreeContextMenu;
        private getOrientation();
        private setOrientation(orientation);
        private notifyOrientationChanged(orientation);
        onOrientationChanged(listener: (orientation: ItemViewContextMenuOrientation) => void): void;
        unOrientationChanged(listener: (orientation: ItemViewContextMenuOrientation) => void): void;
        private startDrag(dragListener, upListener);
        private stopDrag(dragListener, upListener);
        private restrainX(x);
        private restrainY(y, notClicked?);
    }
    class ItemViewContextMenuArrow extends api.dom.DivEl {
        private static clsBottom;
        private static clsTop;
        private static clsLeft;
        private static clsRight;
        constructor();
        toggleVerticalPosition(bottom: boolean): void;
        getWidth(): number;
        getHeight(): number;
    }
}
declare module api.liveedit {
    enum ItemViewContextMenuPosition {
        TOP = 0,
        BOTTOM = 1,
        NONE = 2,
    }
}
declare module api.liveedit {
    import Region = api.content.page.region.Region;
    import RegionPath = api.content.page.region.RegionPath;
    import Component = api.content.page.region.Component;
    import ComponentPath = api.content.page.region.ComponentPath;
    import ComponentType = api.content.page.region.ComponentType;
    class RegionViewBuilder {
        liveEditModel: LiveEditModel;
        parentElement: api.dom.Element;
        parentView: ItemView;
        region: Region;
        element: api.dom.Element;
        setLiveEditModel(value: LiveEditModel): RegionViewBuilder;
        setParentElement(value: api.dom.Element): RegionViewBuilder;
        setParentView(value: ItemView): RegionViewBuilder;
        setRegion(value: Region): RegionViewBuilder;
        setElement(value: api.dom.Element): RegionViewBuilder;
    }
    class RegionView extends ItemView {
        private parentView;
        private region;
        private componentViews;
        private componentIndex;
        private itemViewAddedListeners;
        private itemViewRemovedListeners;
        private itemViewAddedListener;
        private itemViewRemovedListener;
        private componentAddedListener;
        private componentRemovedListener;
        private mouseDownLastTarget;
        private mouseOverListener;
        static debug: boolean;
        constructor(builder: RegionViewBuilder);
        private initListeners();
        private isElementOverRegion(element);
        memorizeLastMouseDownTarget(event: MouseEvent): void;
        private addRegionContextMenuActions();
        getParentItemView(): ItemView;
        setParentItemView(itemView: ItemView): void;
        setRegion(region: Region): void;
        getRegion(): Region;
        getRegionName(): string;
        getRegionPath(): RegionPath;
        getName(): string;
        highlightSelected(): void;
        showCursor(): void;
        handleClick(event: MouseEvent): void;
        select(clickPosition?: Position, menuPosition?: ItemViewContextMenuPosition, isNew?: boolean, rightClicked?: boolean): void;
        selectWithoutMenu(isNew?: boolean): void;
        toString(): string;
        registerComponentView(componentView: ComponentView<Component>, index: number, isNew?: boolean): void;
        unregisterComponentView(componentView: ComponentView<Component>): void;
        getNewItemIndex(): number;
        addComponentView(componentView: ComponentView<Component>, index: number, isNew?: boolean, dragged?: boolean): void;
        removeComponentView(componentView: ComponentView<Component>): void;
        getComponentViews(): ComponentView<Component>[];
        getComponentViewIndex(view: ComponentView<Component>): number;
        getComponentViewByIndex(index: number): ComponentView<Component>;
        getComponentViewByPath(path: ComponentPath): ComponentView<Component>;
        hasParentLayoutComponentView(): boolean;
        hasOnlyMovingComponentViews(): boolean;
        isEmpty(): boolean;
        empty(): void;
        remove(): RegionView;
        toItemViewArray(): ItemView[];
        onItemViewAdded(listener: (event: ItemViewAddedEvent) => void): void;
        unItemViewAdded(listener: (event: ItemViewAddedEvent) => void): void;
        private notifyItemViewAddedForAll(itemViews);
        private notifyItemViewAdded(itemView, isNew?);
        onItemViewRemoved(listener: (event: ItemViewRemovedEvent) => void): void;
        unItemViewRemoved(listener: (event: ItemViewRemovedEvent) => void): void;
        getRegionView(): RegionView;
        createComponent(componentType: ComponentType): Component;
        private notifyItemViewRemovedForAll(itemViews);
        private notifyItemViewRemoved(itemView);
        static isRegionViewFromHTMLElement(htmlElement: HTMLElement): boolean;
        private parseComponentViews();
        private doParseComponentViews(parentElement?);
        private handleDragEnter(event);
        private handleDragLeave(event);
        private handleDragOver(event);
        private handleDrop(event);
    }
}
declare module api.liveedit {
    class RegionComponentViewer extends api.ui.NamesAndIconViewer<api.content.page.region.Region> {
        constructor();
        resolveDisplayName(object: api.content.page.region.Region): string;
        resolveSubName(object: api.content.page.region.Region, relativePath?: boolean): string;
        resolveIconClass(object: api.content.page.region.Region): string;
    }
}
declare module api.liveedit {
    class ItemViewPlaceholder extends api.dom.DivEl {
        constructor();
        showRenderingError(url: string, errorMessage?: string): void;
        select(): void;
        deselect(): void;
    }
}
declare module api.liveedit {
    class DragPlaceholder extends ItemViewPlaceholder {
        private itemType;
        private pattern;
        private regionView;
        private messageEl;
        private static instance;
        static debug: boolean;
        static get(): DragPlaceholder;
        constructor();
        setItemType(type: ItemType): DragPlaceholder;
        private getDefaultText();
        setDropAllowed(allowed: boolean): DragPlaceholder;
        setText(text: string): DragPlaceholder;
        setRegionView(regionView: RegionView): DragPlaceholder;
        reset(): DragPlaceholder;
    }
}
declare module api.liveedit {
    import Region = api.content.page.region.Region;
    class RegionPlaceholder extends ItemViewPlaceholder {
        private region;
        constructor(region: Region);
    }
}
declare module api.liveedit {
    import Component = api.content.page.region.Component;
    import ComponentPath = api.content.page.region.ComponentPath;
    class ComponentViewBuilder<COMPONENT extends Component> {
        itemViewProducer: ItemViewIdProducer;
        type: ComponentItemType;
        parentRegionView: RegionView;
        parentElement: api.dom.Element;
        component: COMPONENT;
        element: api.dom.Element;
        positionIndex: number;
        contextMenuActions: api.ui.Action[];
        placeholder: ItemViewPlaceholder;
        viewer: api.ui.Viewer<any>;
        inspectActionRequired: boolean;
        /**
         * Optional. The ItemViewIdProducer of parentRegionView will be used if not set.
         */
        setItemViewProducer(value: ItemViewIdProducer): ComponentViewBuilder<COMPONENT>;
        setType(value: ComponentItemType): ComponentViewBuilder<COMPONENT>;
        setParentRegionView(value: RegionView): ComponentViewBuilder<COMPONENT>;
        setParentElement(value: api.dom.Element): ComponentViewBuilder<COMPONENT>;
        setComponent(value: COMPONENT): ComponentViewBuilder<COMPONENT>;
        setElement(value: api.dom.Element): ComponentViewBuilder<COMPONENT>;
        setPositionIndex(value: number): ComponentViewBuilder<COMPONENT>;
        setContextMenuActions(actions: api.ui.Action[]): ComponentViewBuilder<COMPONENT>;
        setPlaceholder(value: ItemViewPlaceholder): ComponentViewBuilder<COMPONENT>;
        setInspectActionRequired(value: boolean): ComponentViewBuilder<COMPONENT>;
        setViewer(value: api.ui.Viewer<any>): ComponentViewBuilder<COMPONENT>;
    }
    class ComponentView<COMPONENT extends Component> extends ItemView implements api.Cloneable {
        private parentRegionView;
        protected component: COMPONENT;
        private moving;
        private itemViewAddedListeners;
        private itemViewRemovedListeners;
        private propertyChangedListener;
        private resetListener;
        static debug: boolean;
        constructor(builder: ComponentViewBuilder<COMPONENT>);
        private registerComponentListeners(component);
        private unregisterComponentListeners(component);
        private addComponentContextMenuActions(inspectActionRequired);
        remove(): ComponentView<Component>;
        getType(): ComponentItemType;
        setComponent(component: COMPONENT): void;
        getComponent(): COMPONENT;
        hasComponentPath(): boolean;
        getComponentPath(): ComponentPath;
        getName(): string;
        getParentItemView(): RegionView;
        setParentItemView(regionView: RegionView): void;
        setMoving(value: boolean): void;
        isMoving(): boolean;
        clone(): ComponentView<Component>;
        private duplicate(duplicate);
        private createFragment();
        toString(): string;
        replaceWith(replacement: ComponentView<Component>): void;
        moveToRegion(toRegionView: RegionView, toIndex: number, dragged?: boolean): void;
        onItemViewAdded(listener: (event: ItemViewAddedEvent) => void): void;
        unItemViewAdded(listener: (event: ItemViewAddedEvent) => void): void;
        notifyItemViewAdded(view: ItemView, isNew?: boolean): void;
        onItemViewRemoved(listener: (event: ItemViewRemovedEvent) => void): void;
        unItemViewRemoved(listener: (event: ItemViewRemovedEvent) => void): void;
        notifyItemViewRemoved(view: ItemView): void;
        getNewItemIndex(): number;
        addComponentView(componentView: ComponentView<Component>, index: number): void;
        getRegionView(): RegionView;
        isEmpty(): boolean;
        static findParentRegionViewHTMLElement(htmlElement: HTMLElement): HTMLElement;
        private handleDragStart2(event);
        private handleDrag(event);
        private handleDragEnd(event);
    }
}
declare module api.liveedit {
    import Component = api.content.page.region.Component;
    import ContentTypeName = api.schema.content.ContentTypeName;
    class ContentBasedComponentViewBuilder<COMPONENT extends Component> extends ComponentViewBuilder<COMPONENT> {
        contentTypeName: ContentTypeName;
        setContentTypeName(contentTypeName: ContentTypeName): ContentBasedComponentViewBuilder<COMPONENT>;
    }
    class ContentBasedComponentView<COMPONENT extends Component> extends ComponentView<COMPONENT> {
        private contentTypeName;
        constructor(builder: ContentBasedComponentViewBuilder<COMPONENT>);
        private addEditActionToMenu();
        private createEditAction();
        private generateContentSummaryAndCompareStatus();
        protected getContentId(): ContentId;
    }
}
declare module api.liveedit {
    class PagePlaceholder extends ItemViewPlaceholder {
        constructor(pageView: PageView);
        private createControllerDropdown(pageView, infoBlock);
        private addControllerDropdownEvents(controllerDropdown, pageView, infoBlock);
    }
}
declare module api.liveedit {
    class PagePlaceholderInfoBlock extends api.dom.DivEl {
        private line1;
        private line2;
        constructor();
        setTextForContent(contentTypeDisplayName: string): void;
        setBaseHeader(value?: string): void;
        setNoControllersAvailableText(): void;
    }
}
declare module api.liveedit {
    import Component = api.content.page.region.Component;
    import RegionPath = api.content.page.region.RegionPath;
    import ComponentPath = api.content.page.region.ComponentPath;
    class PageViewBuilder {
        liveEditModel: LiveEditModel;
        itemViewProducer: ItemViewIdProducer;
        element: api.dom.Body;
        setLiveEditModel(value: LiveEditModel): PageViewBuilder;
        setItemViewProducer(value: ItemViewIdProducer): PageViewBuilder;
        setElement(value: api.dom.Body): PageViewBuilder;
        build(): PageView;
    }
    class PageView extends ItemView {
        private pageModel;
        private regionViews;
        private fragmentView;
        private viewsById;
        private ignorePropertyChanges;
        private itemViewAddedListeners;
        private itemViewRemovedListeners;
        private pageLockedListeners;
        private resetAction;
        private itemViewAddedListener;
        private itemViewRemovedListener;
        private scrolledListener;
        static debug: boolean;
        private propertyChangedListener;
        private pageModeChangedListener;
        private customizeChangedListener;
        private lockedContextMenu;
        private disableContextMenu;
        private closeTextEditModeButton;
        private editorToolbar;
        private highlightingAllowed;
        private nextClickDisabled;
        constructor(builder: PageViewBuilder);
        private registerPageModel();
        private unregisterPageModel(pageModel);
        private addPageContextMenuActions();
        private initListeners();
        private createCloseTextEditModeEl();
        private isPageScrolled();
        private toggleStickyToolbar();
        appendContainerForTextToolbar(): void;
        hasToolbarContainer(): boolean;
        getEditorToolbarHeight(): number;
        private setIgnorePropertyChanges(value);
        highlightSelected(): void;
        showCursor(): void;
        shade(): void;
        unshade(): void;
        private listenToMouseEvents();
        select(clickPosition?: Position, menuPosition?: ItemViewContextMenuPosition, isNew?: boolean, rightClicked?: boolean): void;
        selectWithoutMenu(isNew?: boolean): void;
        showContextMenu(clickPosition?: Position, menuPosition?: ItemViewContextMenuPosition): void;
        createLockedContextMenu(): ItemViewContextMenu;
        getLockedMenuActions(): api.ui.Action[];
        selectLocked(pos: Position): void;
        deselectLocked(): void;
        handleShaderClick(event: MouseEvent): void;
        handleClick(event: MouseEvent): void;
        private isTextEditorToolbarClicked(event);
        private isTextEditorDialogClicked(event);
        hideContextMenu(): void;
        isLocked(): boolean;
        setLockVisible(visible: boolean): void;
        setLocked(locked: boolean): void;
        isTextEditMode(): boolean;
        setTextEditMode(flag: boolean): void;
        private addVerticalSpaceForEditorToolbar();
        getPageView(): PageView;
        private updateVerticalSpaceForEditorToolbar();
        private waitUntilEditorToolbarShown();
        private removeVerticalSpaceForEditorToolbar();
        private getEditorToolbarWidth();
        hasTargetWithinTextComponent(target: HTMLElement): false;
        isEmpty(): boolean;
        private isContentEmpty();
        getName(): string;
        getIconUrl(content: api.content.Content): string;
        getIconClass(): string;
        getParentItemView(): ItemView;
        setParentItemView(itemView: ItemView): void;
        private registerRegionView(regionView);
        unregisterRegionView(regionView: RegionView): void;
        getRegions(): RegionView[];
        getFragmentView(): ComponentView<Component>;
        toItemViewArray(): ItemView[];
        hasSelectedView(): boolean;
        getSelectedView(): ItemView;
        getItemViewById(id: ItemViewId): ItemView;
        getItemViewsByType(type: ItemType): ItemView[];
        getItemViewByElement(element: HTMLElement): ItemView;
        getRegionViewByElement(element: HTMLElement): RegionView;
        getComponentViewByElement(element: HTMLElement): ComponentView<Component>;
        getRegionViewByPath(path: RegionPath): RegionView;
        getComponentViewByPath(path: ComponentPath): ComponentView<Component>;
        private registerItemView(view);
        private unregisterItemView(view);
        private parseItemViews();
        private doParseItemViews(parentElement?);
        private doParseFragmentItemViews(parentElement?);
        unregisterFragmentComponentView(componentView: ComponentView<Component>): void;
        registerFragmentComponentView(componentView: ComponentView<Component>): void;
        onItemViewAdded(listener: (event: ItemViewAddedEvent) => void): void;
        unItemViewAdded(listener: (event: ItemViewAddedEvent) => void): void;
        private notifyItemViewAdded(itemView);
        onItemViewRemoved(listener: (event: ItemViewRemovedEvent) => void): void;
        unItemViewRemoved(listener: (event: ItemViewRemovedEvent) => void): void;
        private notifyItemViewRemoved(itemView);
        onPageLocked(listener: (event: any) => void): void;
        unPageLocked(listener: (event: any) => void): void;
        private notifyPageLockChanged(locked);
        setDisabledContextMenu(value: boolean): void;
        isDisabledContextMenu(): boolean;
        setHighlightingAllowed(value: boolean): void;
        setNextClickDisabled(value: boolean): void;
        isHighlightingAllowed(): boolean;
        isNextClickDisabled(): boolean;
    }
}
declare module api.liveedit {
    import PartComponentView = api.liveedit.part.PartComponentView;
    class ContentViewBuilder {
        parentPartComponentView: PartComponentView;
        parentElement: api.dom.Element;
        element: api.dom.Element;
        setParentPartComponentView(value: PartComponentView): ContentViewBuilder;
        setParentElement(value: api.dom.Element): ContentViewBuilder;
        setElement(value: api.dom.Element): ContentViewBuilder;
    }
    class ContentView extends ItemView {
        private parentPartComponentView;
        constructor(builder: ContentViewBuilder);
        private createContentContextMenuActions();
        isEmpty(): boolean;
        getParentItemView(): PartComponentView;
        setParentItemView(partView: PartComponentView): void;
    }
}
declare module api.liveedit {
    class PageLockedEvent extends api.event.Event {
        private pageView;
        constructor(pageView: PageView);
        getPageView(): PageView;
        static on(handler: (event: PageLockedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: PageLockedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    class PageUnlockedEvent extends api.event.Event {
        private pageView;
        constructor(pageView: PageView);
        getPageView(): PageView;
        static on(handler: (event: PageUnlockedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: PageUnlockedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    class PageUnloadedEvent extends api.event.Event {
        private pageView;
        constructor(pageView: PageView);
        getPageView(): PageView;
        static on(handler: (event: PageUnloadedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: PageUnloadedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    class PageTextModeStartedEvent extends api.event.Event {
        private pageView;
        constructor(pageView: PageView);
        getPageView(): PageView;
        static on(handler: (event: PageTextModeStartedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: PageTextModeStartedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Event = api.event.Event;
    import Component = api.content.page.region.Component;
    class ComponentViewDragStartedEvent extends Event {
        private componentView;
        constructor(componentView?: ComponentView<Component>);
        getComponentView(): ComponentView<Component>;
        static on(handler: (event: ComponentViewDragStartedEvent) => void, contextWindow?: Window): void;
        static un(handler: (event: ComponentViewDragStartedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Event = api.event.Event;
    import Component = api.content.page.region.Component;
    class ComponentViewDragStoppedEvent extends Event {
        private componentView;
        constructor(componentView?: ComponentView<Component>);
        getComponentView(): ComponentView<Component>;
        static on(handler: (event: ComponentViewDragStoppedEvent) => void, contextWindow?: Window): void;
        static un(handler: (event: ComponentViewDragStoppedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Event = api.event.Event;
    import Component = api.content.page.region.Component;
    class ComponentViewDragCanceledEvent extends Event {
        private componentView;
        constructor(componentView: ComponentView<Component>);
        getComponentView(): ComponentView<Component>;
        static on(handler: (event: ComponentViewDragStoppedEvent) => void, contextWindow?: Window): void;
        static un(handler: (event: ComponentViewDragStoppedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Event = api.event.Event;
    import Component = api.content.page.region.Component;
    class ComponentViewDragDroppedEvent extends Event {
        private componentView;
        private regionView;
        constructor(view: ComponentView<Component>, region: RegionView);
        getComponentView(): ComponentView<Component>;
        getRegionView(): RegionView;
        static on(handler: (event: ComponentViewDragDroppedEvent) => void, contextWindow?: Window): void;
        static un(handler: (event: ComponentViewDragDroppedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    class PageSelectedEvent extends api.event.Event {
        private pageView;
        constructor(pageView: PageView);
        getPageView(): PageView;
        static on(handler: (event: PageSelectedEvent) => void, contextWindow?: Window): void;
        static un(handler: (event: PageSelectedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import RegionView = api.liveedit.RegionView;
    class RegionSelectedEvent extends api.event.Event {
        private pageItemView;
        constructor(regionView: RegionView);
        getRegionView(): RegionView;
        static on(handler: (event: RegionSelectedEvent) => void, contextWindow?: Window): void;
        static un(handler: (event: RegionSelectedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Component = api.content.page.region.Component;
    class ComponentAddedEvent extends api.event.Event {
        private componentView;
        private parentRegionView;
        private dragged;
        constructor(componentView: ComponentView<Component>, regionView: RegionView, dragged?: boolean);
        getComponentView(): ComponentView<Component>;
        getParentRegionView(): RegionView;
        isDragged(): boolean;
        static on(handler: (event: ComponentAddedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: ComponentAddedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Component = api.content.page.region.Component;
    class ComponentRemovedEvent extends api.event.Event {
        private componentView;
        private parentRegionView;
        constructor(componentView: ComponentView<Component>, regionView: RegionView);
        getComponentView(): ComponentView<Component>;
        getParentRegionView(): RegionView;
        static on(handler: (event: ComponentRemovedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: ComponentRemovedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import ComponentView = api.liveedit.ComponentView;
    import Component = api.content.page.region.Component;
    class ComponentResetEvent extends api.event.Event {
        private newComponentView;
        private oldComponentView;
        constructor(newComponentView: ComponentView<Component>, oldComponentView: ComponentView<Component>);
        getNewComponentView(): ComponentView<Component>;
        getOldComponentView(): ComponentView<Component>;
        static on(handler: (event: ComponentResetEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: ComponentResetEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Component = api.content.page.region.Component;
    class ComponentDuplicatedEvent extends api.event.Event {
        private originalComponentView;
        private duplicatedComponentView;
        constructor(originalComponentView: ComponentView<Component>, duplicatedComponentView: ComponentView<Component>);
        getOriginalComponentView(): ComponentView<Component>;
        getDuplicatedComponentView(): ComponentView<Component>;
        static on(handler: (event: ComponentDuplicatedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: ComponentDuplicatedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Event = api.event.Event;
    import Component = api.content.page.region.Component;
    class ComponentLoadedEvent extends Event {
        private newComponentView;
        private oldComponentView;
        constructor(newComponentView: ComponentView<Component>, oldComponentView: ComponentView<Component>);
        getNewComponentView(): ComponentView<Component>;
        getOldComponentView(): ComponentView<Component>;
        static on(handler: (event: ComponentLoadedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: ComponentLoadedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Event = api.event.Event;
    import FragmentComponentView = api.liveedit.fragment.FragmentComponentView;
    class FragmentComponentLoadedEvent extends Event {
        private fragmentComponentView;
        constructor(fragmentComponentView: FragmentComponentView);
        getFragmentComponentView(): FragmentComponentView;
        static on(handler: (event: FragmentComponentLoadedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: FragmentComponentLoadedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Event = api.event.Event;
    import FragmentComponentView = api.liveedit.fragment.FragmentComponentView;
    class FragmentLoadErrorEvent extends Event {
        private fragmentComponentView;
        constructor(fragmentComponentView: FragmentComponentView);
        getFragmentComponentView(): FragmentComponentView;
        static on(handler: (event: FragmentLoadErrorEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: FragmentLoadErrorEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Event = api.event.Event;
    import FragmentComponentView = api.liveedit.fragment.FragmentComponentView;
    class FragmentComponentReloadRequiredEvent extends Event {
        private fragmentComponentView;
        constructor(fragmentComponentView: FragmentComponentView);
        getFragmentComponentView(): FragmentComponentView;
        static on(handler: (event: FragmentComponentReloadRequiredEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: FragmentComponentReloadRequiredEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    interface Position {
        x: number;
        y: number;
    }
}
declare module api.liveedit {
    class LiveEditPageViewReadyEvent extends api.event.Event {
        private pageView;
        constructor(pageView?: PageView);
        getPageView(): PageView;
        static on(handler: (event: LiveEditPageViewReadyEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: LiveEditPageViewReadyEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Component = api.content.page.region.Component;
    class DragAndDrop {
        static debug: boolean;
        private static messageCounter;
        private static instance;
        private pageView;
        REGION_SELECTOR: string;
        ITEM_NOT_DRAGGABLE_SELECTOR: string;
        PLACEHOLDER_CONTAINER_SELECTOR: string;
        DRAGGED_OVER_CLASS: string;
        DRAGGING_ACTIVE_CLASS: string;
        SORTABLE_ITEMS_SELECTOR: string;
        private dragging;
        private wasDropped;
        private wasDestroyed;
        private newItemItemType;
        private draggedComponentView;
        private dragStartedListeners;
        private dragStoppedListeners;
        private droppedListeners;
        private canceledListeners;
        static init(pageView: PageView): void;
        static get(): DragAndDrop;
        constructor(pageView: PageView);
        isDragging(): boolean;
        createSortableLayout(component: ItemView): void;
        refreshSortable(): void;
        private processMouseOverRegionView(regionView);
        private processMouseOutRegionView(regionView);
        createSortable(selector: any): void;
        createDraggable(jq: JQuery): void;
        destroyDraggable(jq: JQuery): void;
        handleDraggableStart(event: Event, ui: JQueryUI.DraggableEventUIParams): void;
        handleDraggableStop(event: Event, ui: JQueryUI.DraggableEventUIParams): void;
        handleSortStart(event: JQueryEventObject, ui: JQueryUI.SortableUIParams): void;
        handleBeforeStop(event: JQueryEventObject, ui: JQueryUI.SortableUIParams): void;
        handleSortStop(event: JQueryEventObject, ui: JQueryUI.SortableUIParams): void;
        handleActivate(event: JQueryEventObject, ui: JQueryUI.SortableUIParams): void;
        handleDeactivate(event: JQueryEventObject, ui: JQueryUI.SortableUIParams): void;
        handleDragOver(event: JQueryEventObject, ui: JQueryUI.SortableUIParams): void;
        handleDragOut(event: JQueryEventObject, ui: JQueryUI.SortableUIParams): void;
        handleSortChange(event: JQueryEventObject, ui: JQueryUI.SortableUIParams): void;
        handleSortUpdate(event: JQueryEventObject, ui: JQueryUI.SortableUIParams): void;
        handleRemove(event: JQueryEventObject, ui: JQueryUI.SortableUIParams): void;
        handleReceive(event: JQueryEventObject, ui: JQueryUI.SortableUIParams): void;
        private cancelDrag(sortable);
        onDragStarted(listener: (componentView: ComponentView<Component>) => void): void;
        unDragStarted(listener: (componentView: ComponentView<Component>) => void): void;
        private notifyDragStarted(componentView);
        onDragStopped(listener: (componentView: ComponentView<Component>) => void): void;
        unDragStopped(listener: (componentView: ComponentView<Component>) => void): void;
        private notifyDragStopped(componentView);
        onDropped(listener: (componentView: ComponentView<Component>, regionView: RegionView) => void): void;
        unDropped(listener: (componentView: ComponentView<Component>, regionView: RegionView) => void): void;
        private notifyDropped(componentView, regionView);
        onCanceled(listener: (componentView: ComponentView<Component>) => void): void;
        unCanceled(listener: (componentView: ComponentView<Component>) => void): void;
        private notifyCanceled(componentView);
        private updateHelperAndPlaceholder(regionView, enter?);
        private getItemType();
        private isDraggingFromContextWindow();
        private isDraggingLayoutOverLayout(regionView, draggingItemType);
        private getComponentView(jq);
        private getRegionView(jq);
        private createSortableItemsSelector();
        private updateScrollSensitivity(selector);
        private calculateScrollSensitivity();
    }
}
declare module api.liveedit {
    class LiveEditPageInitializationErrorEvent extends api.event.Event {
        private message;
        constructor(message: string);
        getMessage(): string;
        static on(handler: (event: LiveEditPageInitializationErrorEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: LiveEditPageInitializationErrorEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Event = api.event.Event;
    import Component = api.content.page.region.Component;
    class ComponentInspectedEvent extends Event {
        private componentView;
        constructor(componentView?: ComponentView<Component>);
        getComponentView(): ComponentView<Component>;
        static on(handler: (event: ComponentInspectedEvent) => void, contextWindow?: Window): void;
        static un(handler: (event: ComponentInspectedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import Event = api.event.Event;
    class PageInspectedEvent extends Event {
        constructor();
        static on(handler: (event: PageInspectedEvent) => void, contextWindow?: Window): void;
        static un(handler: (event: PageInspectedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import ModalDialog = api.util.htmlarea.dialog.ModalDialog;
    class LiveEditPageDialogCreatedEvent extends api.event.Event {
        private dialog;
        private config;
        constructor(dialog: ModalDialog, config: any);
        getModalDialog(): ModalDialog;
        getConfig(): any;
        static on(handler: (event: LiveEditPageDialogCreatedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: LiveEditPageDialogCreatedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    import FragmentComponentView = api.liveedit.fragment.FragmentComponentView;
    import ComponentType = api.content.page.region.ComponentType;
    class ComponentFragmentCreatedEvent extends api.event.Event {
        private sourceComponentType;
        private fragmentComponentView;
        private fragmentContent;
        constructor(fragmentComponentView: FragmentComponentView, sourceComponentType: ComponentType, fragmentContent: api.content.Content);
        getComponentView(): FragmentComponentView;
        getFragmentContent(): api.content.Content;
        getSourceComponentType(): ComponentType;
        static on(handler: (event: ComponentFragmentCreatedEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: ComponentFragmentCreatedEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit {
    class ShowWarningLiveEditEvent extends api.event.Event {
        private message;
        constructor(message: string);
        getMessage(): string;
        static on(handler: (event: ShowWarningLiveEditEvent) => void, contextWindow?: Window): void;
        static un(handler?: (event: ShowWarningLiveEditEvent) => void, contextWindow?: Window): void;
    }
}
declare module api.liveedit.image {
    import ImageComponent = api.content.page.region.ImageComponent;
    import ComponentItemType = api.liveedit.ComponentItemType;
    import RegionView = api.liveedit.RegionView;
    class ImageItemType extends ComponentItemType {
        private static INSTANCE;
        static get(): ImageItemType;
        constructor();
        createView(config: CreateItemViewConfig<RegionView, ImageComponent>): ImageComponentView;
        isComponentType(): boolean;
    }
}
declare module api.liveedit.image {
    import ImageComponent = api.content.page.region.ImageComponent;
    class ImageComponentViewBuilder extends ContentBasedComponentViewBuilder<ImageComponent> {
        constructor();
    }
    class ImageComponentView extends ContentBasedComponentView<ImageComponent> {
        private image;
        protected component: ImageComponent;
        constructor(builder: ImageComponentViewBuilder);
        protected getContentId(): ContentId;
        private handleContentRemovedEvent();
        private initializeImage();
    }
}
declare module api.liveedit.image {
    class ImagePlaceholder extends api.liveedit.ItemViewPlaceholder {
        private imageComponentView;
        private comboBox;
        private comboboxWrapper;
        private imageUploader;
        constructor(imageView: ImageComponentView);
        private initImageCombobox(imageView);
        private initImageUploader(imageView);
        private initImageComboboxWrapper();
        select(): void;
        deselect(): void;
    }
}
declare module api.liveedit.image {
    class ImageComponentViewer extends api.ui.NamesAndIconViewer<api.content.page.region.ImageComponent> {
        constructor();
        resolveDisplayName(object: api.content.page.region.ImageComponent): string;
        resolveSubName(object: api.content.page.region.ImageComponent, relativePath?: boolean): string;
        resolveIconClass(object: api.content.page.region.ImageComponent): string;
    }
}
declare module api.liveedit.part {
    import ComponentItemType = api.liveedit.ComponentItemType;
    import RegionView = api.liveedit.RegionView;
    import PartComponent = api.content.page.region.PartComponent;
    class PartItemType extends ComponentItemType {
        private static INSTANCE;
        static get(): PartItemType;
        constructor();
        isComponentType(): boolean;
        createView(config: CreateItemViewConfig<RegionView, PartComponent>): PartComponentView;
    }
}
declare module api.liveedit.part {
    class PartPlaceholder extends ItemViewPlaceholder {
        private comboBox;
        private displayName;
        private partComponentView;
        constructor(partView: PartComponentView);
        private reloadDescriptorsOnApplicationChange(siteModel);
        setDisplayName(name: string): void;
        select(): void;
        deselect(): void;
    }
}
declare module api.liveedit.part {
    import ComponentView = api.liveedit.ComponentView;
    import ContentView = api.liveedit.ContentView;
    import PartComponent = api.content.page.region.PartComponent;
    class PartComponentViewBuilder extends ComponentViewBuilder<PartComponent> {
        constructor();
    }
    class PartComponentView extends ComponentView<PartComponent> {
        private contentViews;
        constructor(builder: PartComponentViewBuilder);
        private createPlaceholder();
        private resetHrefForRootLink(builder);
        addContent(view: ContentView): void;
        getContentViews(): ContentView[];
        isEmpty(): boolean;
        toItemViewArray(): ItemView[];
        private parseContentViews(parentElement?);
    }
}
declare module api.liveedit.part {
    class PartComponentViewer extends api.ui.NamesAndIconViewer<api.content.page.region.PartComponent> {
        constructor();
        resolveDisplayName(object: api.content.page.region.PartComponent): string;
        resolveSubName(object: api.content.page.region.PartComponent, relativePath?: boolean): string;
        resolveIconClass(object: api.content.page.region.PartComponent): string;
    }
}
declare module api.liveedit.layout {
    import LayoutComponent = api.content.page.region.LayoutComponent;
    import RegionView = api.liveedit.RegionView;
    import ComponentItemType = api.liveedit.ComponentItemType;
    class LayoutItemType extends ComponentItemType {
        private static INSTANCE;
        static get(): LayoutItemType;
        constructor();
        isComponentType(): boolean;
        createView(config: CreateItemViewConfig<RegionView, LayoutComponent>): LayoutComponentView;
    }
}
declare module api.liveedit.layout {
    import Component = api.content.page.region.Component;
    import ComponentPath = api.content.page.region.ComponentPath;
    import LayoutComponent = api.content.page.region.LayoutComponent;
    import ComponentView = api.liveedit.ComponentView;
    import RegionView = api.liveedit.RegionView;
    import ItemView = api.liveedit.ItemView;
    class LayoutComponentViewBuilder extends ComponentViewBuilder<LayoutComponent> {
        constructor();
    }
    class LayoutComponentView extends ComponentView<LayoutComponent> {
        protected component: LayoutComponent;
        private regionViews;
        private itemViewAddedListener;
        private itemViewRemovedListener;
        static debug: boolean;
        constructor(builder: LayoutComponentViewBuilder);
        getRegionViewByName(name: string): RegionView;
        getComponentViewByPath(path: ComponentPath): ComponentView<Component>;
        setComponent(layoutComponent: LayoutComponent): void;
        getRegions(): RegionView[];
        toItemViewArray(): ItemView[];
        private parseRegions();
        private doParseRegions(parentElement?);
        private registerRegionView(regionView);
        private unregisterRegionView(regionView);
    }
}
declare module api.liveedit.layout {
    class LayoutPlaceholder extends ItemViewPlaceholder {
        private comboBox;
        private layoutComponentView;
        constructor(layoutView: LayoutComponentView);
        private reloadDescriptorsOnApplicationChange(siteModel);
        select(): void;
        deselect(): void;
    }
}
declare module api.liveedit.layout {
    class LayoutComponentViewer extends api.ui.NamesAndIconViewer<api.content.page.region.LayoutComponent> {
        constructor();
        resolveDisplayName(object: api.content.page.region.LayoutComponent): string;
        resolveSubName(object: api.content.page.region.LayoutComponent, relativePath?: boolean): string;
        resolveIconClass(object: api.content.page.region.LayoutComponent): string;
    }
}
declare module api.liveedit.text {
    import ComponentItemType = api.liveedit.ComponentItemType;
    import RegionView = api.liveedit.RegionView;
    import TextComponent = api.content.page.region.TextComponent;
    class TextItemType extends ComponentItemType {
        private static INSTANCE;
        static get(): TextItemType;
        constructor();
        createView(config: CreateItemViewConfig<RegionView, TextComponent>): TextComponentView;
        isComponentType(): boolean;
        protected getItemTypeConfig(itemType: string): ItemTypeConfig;
    }
}
declare module api.liveedit.text {
    class TextPlaceholder extends ItemViewPlaceholder {
        constructor();
    }
}
declare module api.liveedit.text {
    import ComponentView = api.liveedit.ComponentView;
    import TextComponent = api.content.page.region.TextComponent;
    class TextComponentViewBuilder extends ComponentViewBuilder<TextComponent> {
        constructor();
    }
    class TextComponentView extends ComponentView<TextComponent> {
        protected component: TextComponent;
        private rootElement;
        private htmlAreaEditor;
        private isInitializingEditor;
        private focusOnInit;
        private editorContainer;
        static debug: boolean;
        private static DEFAULT_TEXT;
        private static EDITOR_FOCUSED_CLASS;
        static DBL_CLICK_TIMEOUT: number;
        private singleClickTimer;
        private lastClicked;
        private modalDialog;
        private currentDialogConfig;
        private authRequest;
        private editableSourceCode;
        constructor(builder: TextComponentViewBuilder);
        private reInitEditor();
        private getContent();
        private getContentPath();
        private getApplicationKeys();
        private isAllTextSelected();
        private handlePasteEvent();
        highlight(): void;
        unhighlight(): void;
        private initializeRootElement();
        private doHandleDbClick(event);
        private doHandleClick(event);
        handleClick(event: MouseEvent): void;
        isEditMode(): boolean;
        isActive(): boolean;
        setEditMode(flag: boolean): void;
        private triggerEventInActiveEditorForFirefox(eventName);
        private onFocusHandler(e);
        private onBlurHandler(e);
        private onKeydownHandler(e);
        private initEditor();
        private doInitEditor();
        private handleEditorCreated(editor);
        private forceEditorFocus();
        private collapseEditorMenuItems();
        private anyEditorHasFocus();
        private processEditorValue();
        private isEditorEmpty();
        private destroyEditor();
        private selectText();
        private startPageTextEditMode();
        private closePageTextEditMode();
        giveFocus(): boolean;
        private addTextContextMenuActions();
        private isEditorReady();
        extractText(): string;
    }
}
declare module api.liveedit.text {
    class TextComponentViewer extends api.ui.NamesAndIconViewer<api.content.page.region.TextComponent> {
        constructor();
        resolveDisplayName(object: api.content.page.region.TextComponent, componentView?: api.liveedit.text.TextComponentView): string;
        resolveSubName(object: api.content.page.region.TextComponent, relativePath?: boolean): string;
        resolveIconClass(object: api.content.page.region.TextComponent): string;
    }
}
declare module api.liveedit.fragment {
    import FragmentComponent = api.content.page.region.FragmentComponent;
    import ComponentItemType = api.liveedit.ComponentItemType;
    import RegionView = api.liveedit.RegionView;
    class FragmentItemType extends ComponentItemType {
        private static INSTANCE;
        static get(): FragmentItemType;
        constructor();
        createView(config: CreateItemViewConfig<RegionView, FragmentComponent>): FragmentComponentView;
        isComponentType(): boolean;
    }
}
declare module api.liveedit.fragment {
    import FragmentComponent = api.content.page.region.FragmentComponent;
    class FragmentComponentViewBuilder extends ContentBasedComponentViewBuilder<FragmentComponent> {
        constructor();
    }
    class FragmentComponentView extends ContentBasedComponentView<FragmentComponent> {
        protected component: FragmentComponent;
        private fragmentContainsLayout;
        private fragmentContent;
        private fragmentContentLoadedListeners;
        private fragmentLoadErrorListeners;
        private editFragmentAction;
        private loaded;
        constructor(builder: FragmentComponentViewBuilder);
        private handleContentRemovedEvent();
        private handleContentUpdatedEvent();
        private convertToBrokenFragmentView();
        containsLayout(): boolean;
        getFragmentRootComponent(): api.content.page.region.Component;
        getFragmentDisplayName(): string;
        isLoaded(): boolean;
        private loadFragmentContent();
        private addFragmentContextMenuActions(contentAndSummary);
        private parseContentViews(parentElement?, parentType?);
        getContentId(): api.content.ContentId;
        onFragmentContentLoaded(listener: (event: api.liveedit.FragmentComponentLoadedEvent) => void): void;
        unFragmentContentLoaded(listener: (event: api.liveedit.FragmentComponentLoadedEvent) => void): void;
        notifyFragmentContentLoaded(): void;
        onFragmentLoadError(listener: (event: api.liveedit.FragmentLoadErrorEvent) => void): void;
        unFragmentLoadError(listener: (event: api.liveedit.FragmentLoadErrorEvent) => void): void;
        notifyFragmentLoadError(): void;
    }
}
declare module api.liveedit.fragment {
    class FragmentPlaceholder extends api.liveedit.ItemViewPlaceholder {
        private fragmentComponentView;
        private comboBox;
        private comboboxWrapper;
        constructor(fragmentView: FragmentComponentView);
        private isInsideLayout();
        select(): void;
        deselect(): void;
    }
}
declare module api.liveedit.fragment {
    class FragmentComponentViewer extends api.ui.NamesAndIconViewer<api.content.page.region.FragmentComponent> {
        constructor();
        resolveDisplayName(object: api.content.page.region.FragmentComponent): string;
        resolveSubName(object: api.content.page.region.FragmentComponent, relativePath?: boolean): string;
        resolveIconClass(object: api.content.page.region.FragmentComponent): string;
    }
}
declare module api.liveedit {
    class ItemViewIconClassResolver {
        static resolveByView(itemView: ItemView): string;
        static resolveByType(itemType: string, size?: string): string;
    }
}
/**
 * Main file for all admin API classes and methods.
 */
declare var Mousetrap: MousetrapStatic;
