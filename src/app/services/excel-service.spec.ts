import { TestBed } from "@angular/core/testing";

import { ExcelService } from "./excel-service";

describe("ExcelServiceService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: ExcelService = TestBed.get(ExcelService);
    expect(service).toBeTruthy();
  });
});
